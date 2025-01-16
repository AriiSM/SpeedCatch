import faiss
import numpy as np
import os
import json
import re
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from transformers import pipeline


# Configurare model SentenceTransformer
MODEL_PATH = '/Model/stella_en_1.5B_v5'
INDEX_PATH = '/Date_IndexFaiss-MetadateJson/faiss_index.index'
METADATA_PATH = '/Date_IndexFaiss-MetadateJson/metadata.json'
MODEL_NLI_PATH = '/Model/bart-large-mnli-local'

model = SentenceTransformer(MODEL_PATH)

# Variabile globale pentru index și metadate
index = None
metadata = {}

def load_faiss_index():
    """
    Încarcă indexul FAISS și metadatele JSON.
    """
    global index, metadata

    if os.path.exists(INDEX_PATH):
        index = faiss.read_index(INDEX_PATH)
        print(f"Indexul FAISS încărcat cu {index.ntotal} propoziții.")
    else:
        print("Indexul FAISS nu a fost găsit.")
        index = faiss.IndexFlatL2(model.get_sentence_embedding_dimension())
    
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        print(f"Metadate încărcate: {len(metadata)} segmente.")
    else:
        print("Fișierul de metadate nu a fost găsit.")
        metadata = {}

def find_top_matches(query_sentence, top_n=10, threshold=0.4):
    """
    Găsește cele mai bune potriviri în index.
    """
    query_embedding = model.encode([query_sentence])
    faiss.normalize_L2(query_embedding)

    distances, indices = index.search(query_embedding, top_n * 2) 

    results = []
    seen_titles = set()
    for dist, idx in zip(distances[0], indices[0]):
        if idx != -1 and str(idx) in metadata:  
            similarity = 1 - (dist / 2)
            if similarity >= threshold:  
                segment_data = metadata[str(idx)]
                title = segment_data["title"]
                if title not in seen_titles:
                    results.append({
                        "similarity": similarity,
                        "title": title,
                        "text": segment_data["text"]
                    })
                    seen_titles.add(title)
                if len(results) >= top_n:
                    break
    return results

def filter_documents_by_title(title):
    """
    Filtrează documentele al căror titlu începe cu textul furnizat.
    """
    print("Titlu", title)
    results = []
    for segment_id, segment in metadata.items():
        if segment["title"].lower().startswith(title.lower()):
            results.append({
                "title": segment["title"],
                "text": segment["text"]
            })
    print("Rezultat", results)
    return results

def get_sentences_by_title(title):
    """
    Obține propozițiile dintr-un document specific pe baza titlului.
    """
    return [segment["text"] for segment_id, segment in metadata.items() if segment["title"] == title]

def load_existing_index_and_metadata():
    """
    Încarcă indexul FAISS și metadatele existente.
    """
    global index, metadata

    if os.path.exists(INDEX_PATH):
        index = faiss.read_index(INDEX_PATH)
        print(f"Indexul FAISS încărcat cu {index.ntotal} propoziții.")
    else:
        embedding_dim = model.get_sentence_embedding_dimension()
        index = faiss.IndexIDMap2(faiss.IndexFlatL2(embedding_dim))
        print("Indexul FAISS nou creat.")

    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        print(f"Metadate încărcate: {len(metadata)} segmente.")
    else:
        metadata = {}
        print("Fișierul de metadate nou creat.")

    return index, metadata


splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,  
    chunk_overlap=120  
)

def process_file(file_content, title, index, metadata):
    """
    Procesează conținutul fișierului și actualizează indexul și metadatele.
    """
    segments = splitter.split_text(file_content)
    id_counter = max(map(int, metadata.keys()), default=-1) + 1

    for segment in segments:
        if segment.strip():
            embedding = model.encode([segment])
            faiss.normalize_L2(embedding)
            embedding = np.array(embedding, dtype=np.float32)  
            index.add_with_ids(embedding, np.array([id_counter]))
            metadata[str(id_counter)] = {"title": title, "text": segment}
            id_counter += 1
    
    faiss.write_index(index, INDEX_PATH)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)
    print(f"Indexul Faiss a fost salvat la: {INDEX_PATH}")
    print(f"Metadatele au fost salvate la: {METADATA_PATH}")

def extract_relevant_sentence(chunk, prompt):
    
    sentences = re.split(r'(?<=[.!?])\s+', chunk)
    
    sentence_embeddings = model.encode(sentences)
    
    prompt_embedding = model.encode([prompt])
    
    index_sentences = faiss.IndexFlatL2(sentence_embeddings.shape[1])
    
    index_sentences.add(sentence_embeddings)
    
    distances, indices = index_sentences.search(prompt_embedding, k=1)
    
    return sentences[indices[0][0]]

chunks = []  
index_antonim = None  

def process_file_antonim(file_antonim_content):
    """
    Proceseaza continutul fisierului pentru antonime.
    """
    
    global chunks, index_antonim
    
    if chunks is None:
        chunks = []

    if chunks:
        print("Curățăm chunk-urile existente.")
        chunks.clear()

    if index_antonim is None:
        index_antonim = faiss.IndexFlatL2(model.get_sentence_embedding_dimension())
    else:
        if index_antonim.ntotal > 0:
            print("Curățăm indexul antonim existent.")
            index_antonim.reset()  
    
    
    chunk_size = 100
    chunk_overlap = 20
    words = file_antonim_content.split()
    
    for i in range(0, len(words), chunk_size - chunk_overlap):
        chunks.append(" ".join(words[i:i + chunk_size]))
        
    document_embeddings = model.encode(chunks)
    index_antonim = faiss.IndexFlatL2(model.get_sentence_embedding_dimension())
    index_antonim.add(document_embeddings)


def check_truth(prompt):
    """
    Verifică adevărul promptului în raport cu documentele din index.
    """
    global index_antonim, chunks

    if index_antonim is None or len(chunks) == 0:
        return "Indexul pentru antonime nu este inițializat. Încărcați un fișier pentru antonime înainte de a face căutări."

    query_embedding = model.encode([prompt])

    print(f"Cautare in index")

    distances, indices = index_antonim.search(query_embedding, k=1)
    if len(indices[0]) == 0 or indices[0][0] == -1:
        return "Nu s-au găsit potriviri în index."

    closest_index = indices[0][0]
    most_relevant_chunk = chunks[closest_index] 

    print(f"Intra in pipeline")

    nli_model_path = MODEL_NLI_PATH
    tokenizer = AutoTokenizer.from_pretrained(nli_model_path)
    model_anto = AutoModelForSequenceClassification.from_pretrained(nli_model_path)

    nli_model = pipeline("text-classification", model=model_anto, tokenizer=tokenizer)

    premise = most_relevant_chunk
    hypothesis = prompt
    inference = nli_model(f"Premise: {premise} Hypothesis: {hypothesis}")
    label = inference[0]['label']

    if label == "contradiction":
        relevant_sentence = extract_relevant_sentence(most_relevant_chunk, prompt)
        return f"Fals: Prompt-ul contrazice documentul. Informația corectă este: '{relevant_sentence}'"
    elif label == "entailment":
        return "Adevărat: Prompt-ul este în conformitate cu documentul."
    else:
        return "Neclar: Relația dintre prompt și document nu este sigură."





app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received data: {data}")
            message = json.loads(data)

            if message["type"] == "INIT":
                print("Clientul s-a conectat.")
            
                index, metadata = load_existing_index_and_metadata()

                titles = list({segment["title"] for segment in metadata.values()})
                response = {"type": "INIT", "payload": titles}
                await manager.send_message(json.dumps(response), websocket)

            elif message["type"] == "SEARCH":
                query = message["payload"]
                print(f"Received search query: {query}")
                results = find_top_matches(query)
                response = {"type": "SEARCH", "payload": {"query": query, "documents": results}}
                await manager.send_message(json.dumps(response), websocket)

            elif message["type"] == "SEARCH_FILTER":
                query = message["payload"]
                print(f"Received filter search query: {query}")
                results = filter_documents_by_title(query)
                print(f"Filtered documents: {results}")
                response = {"type": "SEARCH_FILTER", "payload": {"query": query, "documents": results}}
                await manager.send_message(json.dumps(response), websocket)
    
            elif message["type"] == "GET_CONTENT":
                title = message["payload"]
                sentences = get_sentences_by_title(title)
                response = {"type": "CONTENT", "payload": {"title": title, "content": sentences}}
                await manager.send_message(json.dumps(response), websocket)

            elif message["type"] == "UPLOAD_FILE":
                file_content = message["payload"]["content"]
                title = message["payload"]["title"]
                title = title.strip().split('.')[0] + '.txt'

                print(f"Received file content: {file_content[:30]}...")  
                index, metadata = load_existing_index_and_metadata()
                process_file(file_content, title, index, metadata)
                response = {"type": "UPLOAD_FILE", "payload": "File processed successfully"}
                await manager.send_message(json.dumps(response), websocket)
                
            elif message["type"] == "UPLOAD_FILE_ANTONIM":
                file_antonim_content = message["payload"]["content"]
                title = message["payload"]["title"]
                title = title.strip().split('.')[0] + '.txt'
                print(f"Received file content (ANTONIM): {file_antonim_content[:30]}...")  

                process_file_antonim(file_antonim_content)
                print("Indexul pentru antonime a fost inițializat.")

                response = {"type": "UPLOAD_FILE_ANTONIM", "payload": "File processed successfully"}
                await manager.send_message(json.dumps(response), websocket)
                            
            elif message["type"] == "SEARCH_ANTONIM":

                if not isinstance(message.get("payload"), dict) or "query" not in message["payload"]:
                    response = {
                        "type": "ERROR",
                        "payload": "Payload invalid pentru SEARCH_ANTONIM. Structura corectă: {'query': 'text'}"
                    }
                    await manager.send_message(json.dumps(response), websocket)
                    continue

                query = message["payload"]["query"]
                print(f"Received search query (ANTONIM): {query}")

                truth_check_result = check_truth(query)

                print("[SERVER] Rezultatul verificării de adevăr:", truth_check_result)
            
                response = {
                    "type": "SEARCH_ANTONIM",
                    "payload": {
                        "query": query,
                        "result": truth_check_result
                    },
                }
                await manager.send_message(json.dumps(response), websocket)


    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Clientul s-a deconectat.")