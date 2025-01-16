import os
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
import faiss
import json

# Configurare directoare și modele
MODEL_PATH = 'Model\\stella_en_1.5B_v5'
DATA_PATH = 'data'
DATAS_PATH = 'Date_IndexFaiss-MetadateJson'
INDEX_PATH = os.path.join(DATAS_PATH, "faiss_index.index")
METADATA_PATH = os.path.join(DATAS_PATH, "metadata.json")

# Încarcă modelul
model = SentenceTransformer(MODEL_PATH)

# Configurare text splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size = 400,  
    chunk_overlap = 120  
)

def load_existing_index_and_metadata():
    """
    Încarcă indexul FAISS și metadatele existente.
    """
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

def process_file(file_path, index, metadata):
    """
    Procesează un fișier CSV, creează embedding-uri și salvează totul în indexul Faiss.
    """
    data = pd.read_csv(file_path)
    print("Datele din csv au fost încărcate")

    if not {"article", "highlights"}.issubset(data.columns):
        print(f"Fișierul '{file_path}' nu conține toate coloanele necesare: 'article', 'highlights'")
        return

    id_counter = max(map(int, metadata.keys()), default=-1) + 1
    existing_titles = {meta["title"] for meta in metadata.values()}
    for i, row in data.iterrows():
        if pd.isna(row["article"]) or pd.isna(row["highlights"]):
            print("Ignorăm o intrare cu date incomplete.")
            continue

        title = row["highlights"].strip().split('.')[0] + '.txt'
        text = row["article"].strip()

        if title in existing_titles:
            print(f"Articolul '{title}' este deja în index. Ignorăm.")
            continue

        print(f"Procesăm articolul: {i}")

        segments = splitter.split_text(text)

        embeddings = model.encode(segments, show_progress_bar=True)
        faiss.normalize_L2(embeddings)

        for segment, embedding in zip(segments, embeddings):
            segment_id = id_counter
            
            index.add_with_ids(np.array([embedding], dtype=np.float32), np.array([segment_id]))
            metadata[segment_id] = {"title": title, "text": segment}
            id_counter += 1

    faiss.write_index(index, INDEX_PATH)
    print(f"Indexul Faiss a fost salvat la: {INDEX_PATH}")

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=4)
    print(f"Metadatele au fost salvate la: {METADATA_PATH}")

def main():
    file_path = os.path.join(DATA_PATH, "sampled_cnn_dailymail.csv")
    if not os.path.exists(file_path):
        print(f"Fișierul {file_path} nu există. Verifică locația.")
        return

    index, metadata = load_existing_index_and_metadata()

    print(f"Procesăm fișierul {file_path}...")
    process_file(file_path, index, metadata)

if __name__ == "__main__":
    main()