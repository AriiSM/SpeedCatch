# Antonime - Verificarea Adevărului într-un Document cu Ajutorul NLP

Acest notebook reprezintă un prototip exploratoriu, conceput pentru a dezvolta o soluție de identificare a inconsistențelor textuale în documente. Implementează un sistem bazat pe procesare de limbaj natural (NLP) pentru a verifica adevărul unui prompt comparativ cu un document. Utilizând tehnici avansate de embedare a textului și inferență logică, aplicația poate determina dacă o propoziție este adevărată sau contrazice informațiile dintr-un document dat.

## Funcționalități

1. **Instalarea Pachetelor Necesare**:
    
    - `faiss-cpu`: Utilizat pentru căutarea rapidă a vectorilor semantici.
    - `transformers`: Utilizat pentru modelele pre-antrenate, inclusiv pentru inferență logică.
    - `sentence-transformers`: Pentru generarea de embedding-uri semantice ale textului.
2. **Crearea unui Index de Căutare**:
    
    - Datele sunt procesate pentru a crea un index semantico-vectorial folosind `faiss`. Acesta permite căutarea rapidă a celor mai relevante propoziții în documente mari.
3. **Verificarea Adevărului**:
    
    - După ce un prompt este transformat într-un embedding, funcția de căutare folosește acest embedding pentru a găsi cele mai apropiate propoziții din document.
    - Se folosește modelul `facebook/bart-large-mnli` pentru inferență logică, determinând dacă există o contradicție sau dacă propoziția este conformă cu documentul.
4. **Testarea Funcționalității**:
    
    - Exemplu de prompt testat: „Kaufland își reface stoc-ul lunea.”, iar funcția returnează un rezultat care poate indica dacă informația din prompt este adevărată sau contrazice documentul.

## Tehnologii Folosite

- **Faiss**: Utilizat pentru căutări rapide de vecini apropiați în seturi mari de date.
- **Transformers**: Folosit pentru modelele de inferență logică (BART pentru inferență).
- **Sentence-Transformers**: Pentru generarea embedding-urilor semantice ale textelor.

## Testare
- Textul initial este `Kaufland își face aprovizionarea duminica. Toți angajații sunt instruiți să respecte regulile de securitate. Magazinul se deschide la ora 8 dimineața în fiecare zi.`
- Prompt-ul introdus este `Kaufland își reface stoc-ul lunea.`
- Modelul ofera ca si raspuns `Fals: Prompt-ul contrazice documentul. Informația corectă este: 'Kaufland își face aprovizionarea duminica.`