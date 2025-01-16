# Descrierea functionalitatilor aplicatiei
Aplicatia noastra este un sistem inteligent de gestionare si cautare a informatiilor din diverse domenii, care utilizeaza AI pentru a detecta similaritatile intre texte. 

**Stocarea structurata a informatiilor:**
- Aplicatia va prezenta informatiile organizate in foldere dedicate pentru fiecare topic, cum ar fi carti, lucrari stiintifice, enciclopedii, articole, stiri si altele.
- Utilizatorii vor putea incarca, organiza si gestiona fisiere text sau documente legate de aceste domenii.

**Cautare contextuala avansata:**
- Utilizatorii pot introduce un prompt (interogare sau text de referinta) in aplicatie, iar sistemul va cauta documente care contin informatii contextuale similare cu promptul introdus.
- Motorul de cautare al aplicatiei nu se va limita doar la cautari exacte, ci va putea identifica texte care au o semnificatie asemanatoare, chiar daca limbajul utilizat difera.

**Identificarea similaritatii intre texte:**
- Aplicatia va utiliza algoritmi de procesare a limbajului natural (NLP) pentru a detecta similaritati semantice intre texte, nu doar potriviri la nivel de cuvinte-cheie.

# Descrierea problemei rezolvate cu ajutorul AI
AI-ul, prin tehnici de procesare a limbajului natural (NLP), reuseste sa depaseasca limitarile cautarilor traditionale bazate pe cuvinte-cheie, intelegand contextul si semnificatia semantica a textelor. 
AI-ul analizeaza nu doar cuvintele dintr-un text, ci si contextul semantic. Astfel, aplicatia poate intelege relatiile dintre concepte si idei si poate gasi documente care contin informatii similare, chiar daca sunt exprimate in termeni diferiti.
In loc sa ofere rezultate irelevante bazate doar pe potrivirea exacta a unor termeni, AI-ul selecteaza doar documentele care captureaza esenta sau tema interogarii. Astfel, utilizatorii primesc rezultate precise si nu sunt nevoiti sa filtreze manual mii de fisiere.

**Aplicatia rezolva o problema comuna in gestionarea volumelor mari de informatii:**
- Cum sa gasesti rapid si eficient continut relevant intr-o cantitate vasta de texte, fara a te baza doar pe potrivirea stricta a cuvintelor. Aceasta problema devine esentiala in domenii precum cercetarea academica, educatia si jurnalismul, unde informatia valoroasa poate fi raspandita in diferite documente sau exprimata in moduri diferite.

# Useful Tools and Technologies
Aplicatia noastra foloseste o combinatie de instrumente si tehnologii moderne pentru a asigura functionalitatea avansata de cautare semantica si gestionare a documentelor.
### <u>___Frontend___</u>

Frontend-ul aplicatiei este construit folosind **Ionic** si **React**, care permit crearea unei interfete intuitive si responsive pentru utilizatori. 

### <u>___Backend___</u>
Backend-ul aplicatiei este responsabil pentru gestionarea datelor, logica aplicatiei si interactiunea cu baza de date.

### <u>___Conexiune intre Frontend si Backend___</u>

Conexiunea dintre frontend si backend este realizata prin **WebSockets**, care permite o comunicare bidirectionala in timp real.


### <u>__Inteligenta Artificiala__</u>
Aplicatia noastra utilizeaza algoritmi avansati de procesare a limbajului natural (NLP) si invatare automata (ML) pentru a identifica similaritatile semantice intre texte.
Pentru antrenarea si implementarea modelelor AI, folosim:
- **TensorFlow** si **PyTorch**

#### Librarii NLP (Natural Language Processing)

- **Transformers de la Hugging Face**: Modele pre-antrenate precum BERT sau RoBERTa

# Related Work


1. **Azure Cognitive Search** este un serviciu de căutare în cloud care oferă dezvoltatorilor API-uri și instrumente pentru a crea experiențe de căutare avansate în conținut privat și eterogen, utilizabile în aplicații web, mobile și de tip enterprise. Acesta are multiple componente, incluzând un API pentru indexare și interogare, integrare ușoară prin ingestia de date din Azure, integrare profundă cu Azure Cognitive Services și stocarea persistentă a conținutului indexat deținut de utilizatori. Elementul central al Azure Cognitive Search este motorul său de căutare full-text, bazat pe algoritmul BM25—un standard industrial în recuperarea informațiilor.
- https://techcommunity.microsoft.com/t5/ai-azure-ai-services-blog/introducing-semantic-search-bringing-more-meaningful-results-to/ba-p/2175636

2. **Cohere Search** este o soluție de căutare bazată pe inteligență artificială, dezvoltată de platforma Cohere, care utilizează modele avansate de procesare a limbajului natural (NLP) pentru a îmbunătăți experiența de căutare în cadrul aplicațiilor și organizațiilor. Spre deosebire de soluțiile tradiționale de căutare bazate pe potrivirea strictă a cuvintelor-cheie.
- https://cohere.com/search

3. **Semantic Scholar** este o platformă de căutare academică bazată pe inteligență artificială, care ajută cercetătorii să găsească rapid articole relevante dintr-o gamă largă de domenii științifice.
- https://www.semanticscholar.org/search?q=Semantic&sort=relevance

# Descriere Algoritm Inteligent

- Aplicația utilizează biblioteca **Sentence-Transformers** pentru a genera embeddings (reprezentări numerice) ale descrierilor unor cuvinte dintr-un fișier CSV și pentru un query specific. Aceste embeddings sunt folosite pentru **compararea semantică** a textelor și pentru **vizualizarea** lor într-un spațiu bidimensional.
- Modelul de bază, `all-MiniLM-L6-v2`, este un model de transformare a limbajului natural, optimizat pentru a genera embeddings de propoziții, și bazat pe arhitectura **BERT** (Bidirectional Encoder Representations from Transformers). Este foarte util în căutarea semantică, fiind capabil să capteze relații complexe în propoziții și fraze, transformându-le în vectori numerici.
