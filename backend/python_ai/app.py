import os
import uuid
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import numpy as np

# -------------------------
# Configuration
# -------------------------
DATA_DIR = "./uploaded_files"
CHROMA_COLLECTION = "neuro_dataset"
CHUNK_SIZE = 900           # characters per chunk
CHUNK_OVERLAP = 150        # overlap between chunks

os.makedirs(DATA_DIR, exist_ok=True)

# -------------------------
# Init model + Chroma
# -------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# Create Chroma client (local)
client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory="./chroma_db"))
collection = client.get_or_create_collection(
    name=CHROMA_COLLECTION,
    metadata={"hnsw:space": "cosine"}
)

# -------------------------
# FastAPI + CORS
# -------------------------
app = FastAPI(title="NeuroWell Vector Indexer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Utilities
# -------------------------
def extract_pdf_text(path: str) -> str:
    doc = fitz.open(path)
    text_parts = []
    for page in doc:
        text = page.get_text()
        if text:
            text_parts.append(text)
    return "\n".join(text_parts)

def load_csv_text(path: str) -> str:
    try:
        df = pd.read_csv(path, encoding="utf-8", engine="python")
    except Exception:
        df = pd.read_csv(path, encoding="latin-1", engine="python")
    # choose text-like columns (object dtype)
    text_cols = [c for c in df.columns if df[c].dtype == object]
    if not text_cols:
        # fallback: stringify all
        return df.to_string()
    combined = df[text_cols].astype(str).agg(" ".join, axis=1)
    # join rows with double newline to preserve separation
    return "\n\n".join(combined.tolist())

def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if len(text) <= size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
        if start < 0:
            start = 0
    return [c for c in chunks if c.strip()]

def embed_texts(texts: List[str]):
    # returns list of numpy arrays
    emb = model.encode(texts, convert_to_numpy=True)
    return emb

def safe_file_save(upload_file: UploadFile, dest_dir: str = DATA_DIR) -> str:
    filename = f"{uuid.uuid4().hex}_{upload_file.filename}"
    dest_path = os.path.join(dest_dir, filename)
    with open(dest_path, "wb") as f:
        f.write(upload_file.file.read())
    return dest_path

# -------------------------
# Endpoints
# -------------------------
@app.post("/upload")
async def upload_and_index(files: List[UploadFile] = File(...)):
    """
    Accept multiple PDF or CSV files, extract text, chunk, embed & insert into ChromaDB.
    """
    inserted = 0
    inserted_ids = []

    for upload in files:
        # save file first
        try:
            saved_path = safe_file_save(upload)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save {upload.filename}: {e}")

        # extract text depending on extension
        lower = upload.filename.lower()
        try:
            if lower.endswith(".pdf"):
                raw_text = extract_pdf_text(saved_path)
            elif lower.endswith(".csv"):
                raw_text = load_csv_text(saved_path)
            else:
                # unsupported, skip
                continue
        except Exception as e:
            # continue to next file but return partial success info
            continue

        # chunk long texts
        chunks = chunk_text(raw_text)
        if not chunks:
            continue

        # build ids, metadatas
        ids = [f"{upload.filename}__{i}__{uuid.uuid4().hex}" for i in range(len(chunks))]
        metadatas = [{"source_file": upload.filename, "chunk_index": i} for i in range(len(chunks))]
        documents = chunks

        # embed and add
        try:
            embeddings = embed_texts(documents)
            # convert to plain lists for Chroma
            embeddings_list = [e.tolist() for e in embeddings]
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings_list
            )
            inserted += len(documents)
            inserted_ids.extend(ids)
        except Exception as e:
            # if embedding or insertion failed, continue
            continue

    # persist DB to disk (duckdb+parquet)
    try:
        client.persist()
    except Exception:
        pass

    return {"inserted_chunks": inserted, "inserted_ids_sample": inserted_ids[:10]}

@app.post("/search")
async def search(query: str = Form(...), n_results: int = Form(5)):
    """
    Return top-n similar documents for the given query.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is empty")

    q_emb = model.encode([query], convert_to_numpy=True)[0].tolist()
    # chroma query
    try:
        results = collection.query(
            query_embeddings=[q_emb],
            n_results=n_results,
            include=["documents", "metadatas", "distances", "ids"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # results comes as dict with lists per field
    return results

@app.post("/chat")
async def chat(query: str = Form(...), n_results: int = Form(3)):
    """
    Simple RAG: search and return context snippets that frontend can show or pass to LLM.
    """
    res = await search(query, n_results)
    # build a flattened list of hits
    docs = []
    for idx, doc in enumerate(res.get("documents", [[]])[0]):
        docs.append({
            "id": res.get("ids", [[]])[0][idx],
            "text": doc,
            "metadata": res.get("metadatas", [[]])[0][idx],
            "distance": res.get("distances", [[]])[0][idx]
        })
    # you can later call an LLM here using these docs + query to form a final answer
    return {"query": query, "results": docs}

# Health
@app.get("/health")
def health():
    return {"status": "ok"}
