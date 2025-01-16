### Pașii Aplicației
1.  Încărcarea și Preprocesarea Datasetului
    - Fișierul CSV (`smaller.csv`) este încărcat, iar ultima valoare pentru coloana `cuvant` este redenumită ca „Other” pentru a reprezenta o categorie suplimentară.
    
2.  Generarea Embeddings pentru Propoziții
    ```python
    embedding_arr = model.encode(data['descriere'])
```
    - Modelul `all-MiniLM-L6-v2` creează embeddings pentru fiecare text din coloana `descriere`. Rezultatul este un array bidimensional în care fiecare rezumat este reprezentat printr-un vector de 384 de dimensiuni. Embeddings permit măsurarea similarității semantice între texte.
    
3. Reducerea Dimensionalității folosind PCA (Principal Component Analysis)
```python
    pca = PCA(n_components=2).fit(embedding_arr)
```
  - **PCA** este aplicat pentru a reduce embeddings de la dimensiunea inițială la două dimensiuni.
  - PCA comprimă embeddings într-un format bidimensional, păstrând informațiile esențiale. Această reducere permite **vizualizarea** datelor, oferind o imagine generală a clustering-ului semantic.
    
4.  Calcularea și Sortarea Similarităților
```python
dist = DistanceMetric.get_metric('euclidean') dist_arr = dist.pairwise(embedding_arr, query_embedding.reshape(1, -1)).flatten()

idist_arr_sorted = np.argsort(dist_arr)
    ```
- Modelul generează un embedding pentru query-ul introdus și, folosind **distanța euclidiană**, calculează similaritățile între embedding-ul query-ului și toate embeddings ale rezumatelor.
- Măsurarea distanței între embeddings identifică descrierile cele mai apropiate semantic față de query. Descrierile cu distanța cea mai mică sunt cele mai relevante.
    
5. Afișarea Rezultatelor Similarității
```python
    `print(data['cuvant'].iloc[idist_arr_sorted[:10]])`
```
- Vectorul `dist_arr` este sortat pentru a obține cele mai mici valori dupa calcularea distantei, iar primele zece rezumate sunt selectate și afișate ca fiind cele mai apropiate de query.
    
6.  Vizualizarea Rezultatelor folosind PCA
```python
    `query_pca = pca.transform(query_embedding.reshape(1, -1))[0] plt.scatter(query_pca[0], query_pca[1], c='k', marker='*', s=750, label='query')`
```
- Embedding-ul query-ului este proiectat în același spațiu PCA folosit pentru embeddings, astfel încât să fie vizualizat împreună cu rezumatele din dataset.
    
7. Afișarea Query-ului în Vizualizarea PCA
    - **Query-ul** este afișat ca un punct distinct în graficul PCA, de obicei reprezentat printr-un asterisc negru pentru claritate.
    - **Rol:** Această vizualizare finală oferă utilizatorului o imagine intuitivă asupra modului în care query-ul se aliniază semantic cu diferitele categorii de rezumate din dataset.