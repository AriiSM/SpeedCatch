### 0. Deschide terminalul sau linia de comandă.

### 1. Clonarea repository-ului:
```bash
git clone https://github.com/AriiSM/SpeedCatch/tree/main/Proiect/Backend
```

### 2. Crearea unui mediu virtual
```bash
python -m venv venv
```

### 3. Activeaza mediul virtual
```bash
venv\Scripts\activate
```

### 4. Instalam dependentele
```bash
pip install -r requirements.txt
```

### 5. Rularea serverului
```bash
cd Server
uvicorn serverFastApi:app --reload
```