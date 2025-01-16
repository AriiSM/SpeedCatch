# Migrare de la `all-MiniLM-L6-v2` la `stella_en_1.5B_v5`

Inițial, am ales modelul `all-MiniLM-L6-v2` datorită dimensiunii sale reduse, vitezei mari de procesare și fiabilității demonstrate. Cu toate acestea, la implementarea acestuia, am constatat că nu s-a ridicat la nivelul așteptărilor aplicației. Embeddingurile generate nu erau suficient de precise pentru a asigura o performanță optimă, iar timpul de procesare se dovedea a fi mult prea mare, ceea ce afecta eficiența întregului flux de lucru.

Astfel, am decis să migrăm către modelul `stella_en_1.5B_v5`, care se află în top 5 MTEB (pentru mai multe detalii, consultați documentația ReadData). Acest model, având o capacitate mult mai mare, oferă embeddinguri mult mai rafinate și precise, ceea ce duce la îmbunătățirea considerabilă a calității rezultatelor. De asemenea, deși modelul are o dimensiune mai mare, performanțele sale sunt semnificativ îmbunătățite în ceea ce privește timpul de procesare, datorită optimizărilor sale avansate. Alegerea acestui model a fost un pas esențial pentru asigurarea unei experiențe mai bune pentru utilizatori, printr-o prelucrare mai rapidă și rezultate mai relevante.

| Rank | Model             | Model Size (Million Parameters) | Memory Usage (GB, fp32) | Embedding Dimensions | Max Tokens | Average (56 datasets) | Classification Average (12 datasets) | Clustering Average (11 datasets) | PairClassification Average (3 datasets) | Reranking Average (4 datasets) | Retrieval Average (15 datasets) | STS Average (10 datasets) | Summarization Average (1 datasets) |
| ---- | ----------------- | ------------------------------- | ----------------------- | -------------------- | ---------- | --------------------- | ------------------------------------ | -------------------------------- | --------------------------------------- | ------------------------------ | ------------------------------- | ------------------------- | ---------------------------------- |
| ...  |                   |                                 |                         |                      |            |                       |                                      |                                  |                                         |                                |                                 |                           |                                    |
| 5    | stella_en_1.5B_v5 | 1543                            | 5.75                    | 8192                 | 131072     | 71.19                 | 87.63                                | 57.69                            | 88.07                                   | 61.21                          | 61.01                           | 84.51                     | 31.49                              |
| ...  |                   |                                 |                         |                      |            |                       |                                      |                                  |                                         |                                |                                 |                           |                                    |
| 147  | all-MiniLM-L12-v2 | 33                              | 0.12                    | 384                  | 512        | 56.53                 | 63.21                                | 41.81                            |                                         |                                |                                 |                           |                                    |
- `all-MiniLM-L12-v2` este o versiune mai actualizata a lui `all-MiniLM-L6-v2`, se poate observa din **MTEB English leaderboard** diferenta clara dintre `all-MiniLM-L12-v2` si `stella_en_1.5B_v5`. Decizia de migrare a fost una extrem de buna.

## Testare `stella_en_1.5B_v5` cu `Sakil/sentence_similarity_semantic_search` 
[Documentatie Real Data]()

### **Data Sample:**

| id    | title                                                                                          | author           | text                                                                                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20800 | Specter of Trump Loosens Tongues, if Not Purse Strings, in Silicon Valley - The New York Times | David Streitfeld | PALO ALTO, Calif.  â€”   After years of scorning the political process, Silicon Valley has leapt into the fray. The prospect ...                                                |
| 20801 | Russian warships ready to strike terrorists near Aleppo                                        | nan              | Russian warships ready to strike terrorists near Aleppo 08.11.2016 \| Source: Source: Mil.ru Attack aircraft of the ...                                                         |
| 20802 | Native American Leaders Vow to Stay All Winter, File Lawsuit Against Police                    | Common Dreams    | Videos : Native American Leaders Vow to Stay All Winter, File Lawsuit Against Police Amnesty International are sending a delegation of human rights observers to monitor the... |
### **Testare:**
*query = "a person is a very very old hero" 
rezultat asteptat =>  "Trump is USA's antique hero."*


![Rezultat oferit de stella_en_1.5B_v5:](https://github.com/AriiSM/SpeedCatch/blob/main/Documentatie/03%20RealData/Imagini/Rez2.png)

![Rezultat oferit de Sakil/sentence_similarity_semantic_search:](https://github.com/AriiSM/SpeedCatch/blob/main/Documentatie/03%20RealData/Imagini/Rez1.png)

Se poate observa diferente dintre ele. Stella ofera un scor de similaritate mai ridicat decat sakil, totodata stella ne ofera rezultatul corect in timp ce sakil, nu.

---
# Migrarea de la Căutarea Brută în SQLite la Implementarea cu Faiss

Inițial, am implementat o metodă de căutare brută într-o bază de date SQLite pentru a găsi cele mai relevante rezultate în funcție de query-uri. Ceea ce era ineficient pe măsură ce volumul de date creștea, din cauza timpilor de procesare mari și a complexității de căutare.

Pentru a îmbunătăți performanța și a optimiza procesul, am migrat către Faiss, un framework eficient pentru căutarea de vecini apropiați în seturi mari de date. Faiss utilizează structuri de indexare avansate.

Această schimbare a permis o reducere considerabilă a complexității procesului de căutare, atât din punct de vedere temporal, cât și al resurselor necesare.

## Testarea Altora Indici: IndexFlatIP și HNSW

Înainte de a ajunge la implementarea finală cu Faiss, am testat și alți indici, precum **IndexFlatIP** și **HNSW**. Aceste opțiuni oferă metode diferite pentru optimizarea căutării în baze de date mari:

1. **IndexFlatIP**:
   - Este un index bazat pe produsul intern (Inner Product), care poate fi util atunci când vectorii embedding sunt normalizați și se dorește căutarea vecinilor apropiați folosind această metrica.
   - Am testat acest index, dar am observat că performanțele nu au fost atât de bune ca în cazul IVF, din cauza unui control mai slab asupra numărului de clustere explorate și a complexității calculului.

2. **HNSW (Hierarchical Navigable Small World)**:
   - Acest index este bine cunoscut pentru eficiența sa în căutările pe date de dimensiuni mari, oferind o structură de date care permite căutări foarte rapide cu un cost de memorie mai mic.
   - Deși a avut performanțe bune în scenarii generale, nu am observat o îmbunătățire semnificativă în comparație cu IVF în contextul aplicației noastre.

## Optimizarea Setărilor pentru IVF

Deși am testat și alți indici, am decis utilizarea **IndexIVFFlat** pentru posibilitatea de a ajusta setările pentru o mai bună vizibilitate a modificarilor. 

Pentru IVF, am optimizat parametrii **M** (numărul de clustere) și **nprobe** (numărul de clustere de explorat în timpul căutării), ceea ce a avut un impact semnificativ asupra preciziei căutării, permițându-ne să găsim un echilibru între calitatea și performanța rezultatelor.

## 1. Setarea valorii lui `M` și `nprobe`

### **Neeficient**:
- `M = 2` și `index.nprobe = 1`:
  - **Efecte**:
    - Un număr mic pentru `M` reduce numărul de clustere, ceea ce face căutarea mai rapidă, dar mai imprecisă.
    - `nprobe` mic înseamnă că sunt explorate foarte puține clustere, iar rezultatele relevante pot fi omise.
  - **Impact**:
    - Performanță rapidă, dar precizie scăzută.

### **Eficient**:
- `M = 20` și `index.nprobe = 5`:
  - **Efecte**:
    - Valori mai mari pentru `M` permit crearea unui număr mai mare de clustere, ceea ce îmbunătățește precizia căutării.
    - `nprobe` mai mare permite explorarea unui număr mai mare de clustere, ceea ce duce la obținerea de rezultate mai relevante.
  - **Impact**:
    - Performanță mai lentă, dar cu o precizie mult mai bună.

## 2. Normalizarea embedding-urilor

### **Neeficient și Eficient**:
- Atât în abordarea neeficientă, cât și în cea eficientă, normalizarea embedding-urilor este realizată corect cu `faiss.normalize_L2(embeddings)` și pentru query-ul de căutare (`normalize(query_embedding, norm='l2')`).
- **Efecte**:
  - Normalizarea asigură compararea corectă a vectorilor în același spațiu metric (L2), îmbunătățind calitatea căutării.
  - Este esențială să normalizezi atât embedding-urile de intrare, cât și cele ale query-urilor înainte de căutare.

## 3. Indexarea și Căutarea

### **Neeficient**:
- Folosirea unui număr prea mic de clustere (`M = 2`) face căutarea mai rapidă, dar duce la o precizie scăzută.
- `nprobe = 1` face ca doar un cluster să fie explorat, ceea ce poate duce la omisiuni în rezultate relevante.
- **Impact**:
  - Timp rapid de căutare, dar mai puțină precizie în rezultate.

### **Eficient**:
- Folosirea unui număr mai mare de clustere (`M = 20`) și a unui `nprobe` mai mare (`nprobe = 5`) permite o căutare mai amplă și îmbunătățește precizia rezultatelor.
- **Impact**:
  - Căutarea este mai lentă, dar mai completă și mai precisă.

## 4. Impactul asupra Complexității

### **Neeficient**:
- **Timp**: Mai rapid, dar cu risc mai mare de a pierde rezultate relevante.
- **Memorie**: Mai eficientă din punct de vedere al memoriei, dar cu sacrificiu în precizie.
- **Performanță**: Mai bună în scenarii de căutări rapide, dar cu compromis în calitatea rezultatelor.

### **Eficient**:
- **Timp**: Poate fi mai lent datorită explorării unui număr mai mare de clustere, dar îmbunătățește semnificativ calitatea căutării.
- **Memorie**: Mai costisitor din punct de vedere al memoriei, dar optim pentru aplicații care necesită precizie.
- **Performanță**: Căutări mai lente, dar cu rezultate mai bune.

---
# Concluzie 

- În ansamblu, ambele migrări au contribuit la crearea unei experiențe de utilizator mai eficiente, rapide și precise, consolidând aplicația SpeedCatch ca un instrument de top pentru căutarea semantica și gestionarea documentelor. Alegerea tehnologiilor și a modelelor potrivite a fost esențială pentru a răspunde cerințelor tot mai mari ale utilizatorilor și pentru a asigura scalabilitatea pe termen lung a aplicației.
