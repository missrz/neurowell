import os
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Create Chroma client + collection
client = chromadb.Client()
collection = client.get_or_create_collection(
    name="neuro_dataset",
    metadata={"hnsw:space": "cosine"}
)

# Path where the files are extracted
DATA_PATH = "/mnt/data/extracted"

def load_csv(path):
    try:
        df = pd.read_csv(path, encoding="utf-8", engine="python")
    except:
        df = pd.read_csv(path, encoding="latin-1", engine="python")
    return df

def clean_text(t):
    if isinstance(t, str):
        return t.replace("\n", " ").strip()
    return ""

def process_file(file):
    print(f"Processing: {file}")
    
    df = load_csv(os.path.join(DATA_PATH, file))
    
    # Automatically choose text columns
    text_columns = [col for col in df.columns if df[col].dtype == object]
    
    if not text_columns:
        print(f"No text columns found in {file}")
        return
    
    combined_text = df[text_columns].astype(str).agg(" ".join, axis=1).tolist()
    
    ids = [f"{file}_{i}" for i in range(len(combined_text))]
    embeddings = model.encode(combined_text, convert_to_numpy=False)
    
    collection.add(
        ids=ids,
        documents=combined_text,
        embeddings=[e.tolist() for e in embeddings]
    )
    print(f"Inserted {len(combined_text)} rows from {file}")

def index_all():
    files = os.listdir(DATA_PATH)
    csv_files = [f for f in files if f.endswith(".csv")]

    for file in csv_files:
        process_file(file)

    print("\n🔥 Dataset indexed successfully into ChromaDB!")

index_all()
