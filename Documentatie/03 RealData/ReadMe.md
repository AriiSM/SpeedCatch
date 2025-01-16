# MTEB: Massive Text Embedding Benchmark
[MTEB](https://arxiv.org/abs/2210.07316)
**MTEB: Massive Text Embedding Benchmark** este un set de benchmark-uri conceput pentru a evalua și compara performanța modelelor de **text embeddings** pe un spectru larg de sarcini și domenii. Scopul său este să furnizeze un cadru standardizat pentru evaluarea modelelor de generare de embeddings în diverse aplicații NLP, cum ar fi căutarea semantică, clasificarea textului, detecția anomaliilor etc.
#### **Diverse tipuri de sarcini NLP**
MTEB cuprinde o gamă largă de sarcini, organizate pe categorii. Printre acestea:
- **Semantic Textual Similarity (STS)**  
    Sarcini de măsurare a similarității între perechi de propoziții sau fraze. Exemple includ evaluarea similarității cosinus între embeddings generate.
- **Information Retrieval (IR)**  
    Modelele sunt evaluate pe capacitatea de a găsi documente relevante în seturi mari de date, folosind embeddings pentru reprezentarea documentelor și interogărilor.
- **Clustering**  
    Evaluarea performanței embeddings pentru gruparea textului pe baza similitudinii.
- **Classification**  
    Sarcini în care embeddings sunt utilizate ca caracteristici pentru clasificarea textului.
- **Reranking**  
    Testează abilitatea unui model de embedding de a ordona documentele în funcție de relevanță pentru o interogare.  
- **Diverse task-uri cross-lingvistice**  
    Verifică performanța embeddings în traduceri și sarcini multilingvistice.
    

# DataSet pentru experimentele urmatoare:
Pentru experimentele următoare, a fost utilizat fișierul _"test.csv"_, un subset dintr-un set de date disponibil pe [Kaggle](https://www.kaggle.com/competitions/fake-news/data?select=test.csv), care are următoarea structură: _(id, title, author, text)_. Conținutul textului este neprocesat și prezintă un nivel ridicat de zgomot, nefiind prelucrat sau curățat anterior. Din acest motiv, algoritmii au fost solicitați la capacitate maximă pentru a reuși să deducă contextul.

Embedările au fost generate la nivel de propoziție, iar propozițiile au fost obținute prin segmentarea textului în funcție de caracterul ".". Din cauza acestei metode de segmentare, performanța algoritmilor a fost afectată în anumite cazuri, așa cum se poate observa în exemplele următoare:

- _"StandingRock [https://t.co/NoQyIsWbxv](https://t.co/NoQyIsWbxv) NoDAPL pic.twitter.com/oMa647HviB"_
- _"The N. F. L. likes portraying itself"_
- _"Each Satan-2 missile has the power to devastate an area the size of Texas. [http://www.nbcnews.com/news/wo](http://www.nbcnews.com/news/wo)... [http://www.dailymail.co.uk/sci](http://www.dailymail.co.uk/sci)..."_


# 1. Dunzhang/stella_en_1.5B_v5

## Model:
Conform [MTEB English LeaderBoard](https://huggingface.co/spaces/mteb/leaderboard) stella_en_1.5B_v5 este pe locul 3

| Rank | Model                                                                  | Model Size (Million Parameters) | Memory Usage (GB, fp32) | Embedding Dimensions | Max Tokens | Average (56 datasets) | Classification Average (12 datasets) | Clustering Average (11 datasets) | PairClassification Average (3 datasets) | Reranking Average (4 datasets) | Retrieval Average (15 datasets) | STS Average (10 datasets) | Summarization Average (1 datasets) |
| ---- | ---------------------------------------------------------------------- | ------------------------------- | ----------------------- | -------------------- | ---------- | --------------------- | ------------------------------------ | -------------------------------- | --------------------------------------- | ------------------------------ | ------------------------------- | ------------------------- | ---------------------------------- |
| 1    | NV-Embed-v2                                                            | 7851                            | 29.25                   | 4096                 | 32768      | 72.31                 | 90.37                                | 58.46                            | 88.67                                   | 60.65                          | 62.65                           | 84.31                     | 30.7                               |
| 2    | bge-en-icl                                                             | 7111                            | 26.49                   | 4096                 | 32768      | 71.67                 | 88.95                                | 57.89                            | 88.14                                   | 59.86                          | 62.16                           | 84.24                     | 30.77                              |
| 3    | [stella_en_1.5B_v5](https://huggingface.co/dunzhang/stella_en_1.5B_v5) | 1543                            | 5.75                    | 8192                 | 131072     | 71.19                 | 87.63                                | 57.69                            | 88.07                                   | 61.21                          | 61.01                           | 84.51                     | 31.49                              |
| 4    | SFR-Embedding-2_R                                                      | 7111                            | 26.49                   | 4096                 | 32768      | 70.31                 | 89.05                                | 56.17                            | 88.07                                   | 60.14                          | 60.18                           | 81.26                     | 30.71                              |
| 5    | gte-Qwen2-7B-instruct                                                  | 7613                            | 28.36                   | 3584                 | 131072     | 70.24                 | 86.58                                | 56.92                            | 85.79                                   | 61.42                          | 60.25                           | 83.04                     | 31.35                              |

## DataSet de antrenare
[link](https://huggingface.co/datasets/allenai/c4)
text: string
timestamp: timestamp[s]
url: string
## Metrici
##### Accuratetea o calculeaza in functie de consinus
```text
Cosine Similarity(A,B)= A⋅B​ / ∥A∥∥B∥
Unde:

- A⋅BA \cdot BA⋅B este produsul scalar dintre vectorii AAA și BBB.
- ∥A∥\|A\|∥A∥ și ∥B∥\|B\|∥B∥ sunt normele vectorilor (lungimile acestora).
- Rezultatul este un număr între −1-1−1 și 111:
    - 111 înseamnă similaritate maximă (vectorii sunt identici).
    - 000 înseamnă că vectorii sunt ortogonali (nu au nimic în comun).
    - −1-1−1 indică opoziție maximă (foarte rar folosit în contexte de text embeddings).
    - 
```


## Code
**Step 1**
```bash
!pip install -U sentence-transformers
```
**Step 2**
```python
import torch
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
from sklearn.metrics import DistanceMetric
import matplotlib.pyplot as plt
import matplotlib as mpl
import torch.nn.functional as F
from sentence_transformers import util

model = SentenceTransformer("dunzhang/stella_en_1.5B_v5", trust_remote_code=True).cuda()


class Article:
    def __init__(self, id, title, author, text, text_emb, list_prop, list_prop_emb):
        self.id = id
        self.title = title
        self.author = author
        self.text = text
        self.text_emb = text_emb
        self.list_prop_emb = list_prop_emb
        self.list_prop = list_prop
        
    def __repr__(self):
        return f"Article(id={self.id}, title={self.title}, author={self.author})"
    def get_summary(self, num_sentences=3):
        """Return a short summary of the text (first `num_sentences` sentences)."""
        sentences = self.text.split(".")
        return ". ".join(sentences[:num_sentences]) + "."


# Load the CSV file with articles
data = pd.read_csv('test.csv')

# Initialize the list to store the articles
articole_list = []

# Define a function to compute embeddings
def compute_embeddings(texts, instruction_prefix=""):
    return model.encode(texts, instruction=instruction_prefix)

# Iterate over the dataset to process articles
for i, articol in data.iterrows():
    print(f"Processing Article {i}...")
    
    # Skip if the article text is NaN or empty
    if pd.isna(articol['text']):
        continue

    # Extract sentences from the article
    sentence_list = [sentence.strip() for sentence in articol['text'].split(".") if sentence]

    # Compute embedding for the entire article text
    text_emb = compute_embeddings([articol['text']])  # Single article as a list

    # Compute embeddings for each sentence
    emb_list = compute_embeddings(sentence_list)

    # Create an article dictionary to store relevant information
    articol_final = Article(
        id=articol['id'],
        title=articol['title'],
        author=articol['author'],
        text=articol['text'],
        text_emb=F.normalize(torch.tensor(text_emb), p=2, dim=1).tolist(),  # Normalize
        list_prop=sentence_list,
        list_prop_emb=F.normalize(torch.tensor(emb_list), p=2, dim=1).tolist()  # Normalize
    )
    articole_list.append(articol_final)


query = "a person is a very very old hero"
query_embedding = model.encode(query)

# Dicționar pentru a stoca cele mai similare propoziții pentru fiecare articol
bestSentancePerArticle = {}
for articol in articole_list:

    # Calculăm similaritatea între fiecare propoziție și query
    cos_simProp = util.cos_sim(articol.list_prop_emb, query_embedding)
    
    # similarities = model.similarity(query_embedding, articol.list_prop_emb)
    # Obținem scorurile de similaritate și le sortăm în ordine descrescătoare
    sorted_similarities = sorted(enumerate(cos_simProp[0]), key=lambda x: x[1], reverse=True)
    
    # Salvăm cea mai similară propoziție pentru fiecare articol (index + scor)
    bestSentancePerArticle[articol.id] = sorted_similarities[0]

# Sortăm dicționarul `bestSentancePerArticle` în funcție de scorurile de similaritate, descrescător
sorted_best_sentences = sorted(bestSentancePerArticle.items(), key=lambda x: x[1][1].item(), reverse=True)

# Afișăm primele 5 cele mai similare propoziții pentru query
print("Top-1 most similar sentences to the query:")
for i, (article_id, (index, score)) in enumerate(sorted_best_sentences[:3]):
    articol = next(art for art in articole_list if art.id == article_id)
    print(f"Similarity score: {score.item():.4f}")
    print(f"Article title: {articol.title}")
    print(f"Most similar sentence: {articol.list_prop[index]}")
    print("-" * 40)
```

## Rezultate
![Rezultat oferit de stella_en_1.5B_v5:](https://github.com/LauraDiosan-CS/projects-speedcatch/blob/main/RealData/Documentatie/Rez2.png)

# 2. Sakil/sentence_similarity_semantic_search

## Model:
[Sakil/sentence_similarity_semantic_search]()
- This model is useful for the semantic search,sentence similarity,recommendation system.
## DataSet de antrenare
[link](https://www.kaggle.com/competitions/fake-news/data?select=submit.csv)
- **id**: unique id for a news article
- **title**: the title of a news article
- **author**: author of the news article
- **text**: the text of the article; could be incomplete
- **label**: a label that marks the article as potentially unreliable

- 1: unreliable
- 0: reliable

## Metrici
##### Accuratetea o calculeaza in functie de consinus
```text
Cosine Similarity(A,B)= A⋅B​ / ∥A∥∥B∥
Unde:

- A⋅BA \cdot BA⋅B este produsul scalar dintre vectorii AAA și BBB.
- ∥A∥\|A\|∥A∥ și ∥B∥\|B\|∥B∥ sunt normele vectorilor (lungimile acestora).
- Rezultatul este un număr între −1-1−1 și 111:
    - 111 înseamnă similaritate maximă (vectorii sunt identici).
    - 000 înseamnă că vectorii sunt ortogonali (nu au nimic în comun).
    - −1-1−1 indică opoziție maximă (foarte rar folosit în contexte de text embeddings).
    - 
```

## Code
**Step 1**
```bash
!pip install -U sentence-transformers
```
**Step 2**

```python
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
from sklearn.metrics import DistanceMetric
import matplotlib.pyplot as plt
import matplotlib as mpl
from sentence_transformers import util

model_name="Sakil/sentence_similarity_semantic_search"
model = SentenceTransformer(model_name)

class Article:
    def __init__(self, id, title, author, text, text_emb, list_prop, list_prop_emb):
        self.id = id
        self.title = title
        self.author = author
        self.text = text
        self.text_emb = text_emb
        self.list_prop_emb = list_prop_emb
        self.list_prop = list_prop


    def __repr__(self):
        return f"Article(id={self.id}, title={self.title}, author={self.author})"

    def get_summary(self, num_sentences=3):
        """Return a short summary of the text (first `num_sentences` sentences)."""
        sentences = self.text.split(".")
        return ". ".join(sentences[:num_sentences]) + "."

articole_list = []
data = pd.read_csv('test.csv')
for i, articol in data.iterrows():
    print("ARTICOL", i)
    # Verifică dacă textul articolului nu este gol sau NaN
    if pd.isna(articol['text']):
        continue
    # Extragem propozițiile din text
    sentence_list = [sentence.strip() for sentence in articol['text'].split(".") if sentence]
    # Calculăm embedding-ul pentru întregul text al articolului
    text_emb = model.encode(articol['text'])
    # Calculăm embedding-urile pentru fiecare propoziție
    emb_list = model.encode(sentence_list)
    
    # Creăm un obiect Article și îl adăugăm în lista articolelor
    articol_final = Article(
        id=articol['id'],
        title=articol['title'],
        author=articol['author'],
        text=articol['text'],
        text_emb=text_emb,
        list_prop=sentence_list,
        list_prop_emb=emb_list
    )
    articole_list.append(articol_final)


# Exemplu de query
query = "a person is a very very old hero"
query_embedding = model.encode([query])

# Dicționar pentru a stoca cele mai similare propoziții pentru fiecare articol
bestSentancePerArticle = {}
for articol in articole_list:
    # Calculăm similaritatea între fiecare propoziție și query
    cos_simProp = util.cos_sim(articol.list_prop_emb, query_embedding)
    
    # Obținem scorurile de similaritate și le sortăm în ordine descrescătoare
    sorted_similarities = sorted(enumerate(cos_simProp[0]), key=lambda x: x[1], reverse=True)

    # Salvăm cea mai similară propoziție pentru fiecare articol (index + scor)
    bestSentancePerArticle[articol.id] = sorted_similarities[0]

# Sortăm dicționarul `bestSentancePerArticle` în funcție de scorurile de similaritate, descrescător
sorted_best_sentences = sorted(bestSentancePerArticle.items(), key=lambda x: x[1][1].item(), reverse=True)

# Afișăm primele 5 cele mai similare propoziții pentru query
print("Top-5 most similar sentences to the query:")
for i, (article_id, (index, score)) in enumerate(sorted_best_sentences[:5]):
    articol = next(art for art in articole_list if art.id == article_id)
    print(f"Similarity score: {score.item():.4f}")
    print(f"Article title: {articol.title}")
    print(f"Most similar sentence: {articol.list_prop[index]}")
    print("-" * 40)
```

## Rezultate
![Rezultat oferit de Sakil/sentence_similarity_semantic_search:]()

# Concluzii
#### **Stella (Dunzhang/stella_en_1.5B_v5)** este superior atât față de   **Sakil/sentence_similarity_semantic_search**, cât și față de **all-MiniLM-L6-v2** folosit la inceput. 

- Capacitatea sa ridicată (1.5B parametri) și performanța de top în benchmark-uri explică de ce este pe locul 3 pe **MTEB Leaderboard**.
- Este recomandat pentru aplicații care necesită înțelegerea semantică profundă și precizia în textele complexe.
- Deși MiniLM-L6 are avantajul de a fi rapid și eficient pentru sarcini simple, Stella este alegerea ideală pentru proiecte avansate și critice.
