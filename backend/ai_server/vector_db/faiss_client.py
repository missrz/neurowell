import faiss
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from config import EMBED_MODEL

FAISS_INDEX_PATH = "faiss.index"
DOC_STORE_PATH = "faiss_docs.npy"

model = SentenceTransformer(EMBED_MODEL)

def load_faiss():
    if os.path.exists(FAISS_INDEX_PATH):
        index = faiss.read_index(FAISS_INDEX_PATH)
        print("🔌 FAISS index loaded.")
    else:
        index = faiss.IndexFlatL2(model.get_sentence_embedding_dimension())
        print("🆕 New FAISS index created.")
    return index

def save_faiss(index):
    faiss.write_index(index, FAISS_INDEX_PATH)
    print("💾 Saved FAISS index.")

def save_documents(docs):
    np.save(DOC_STORE_PATH, np.array(docs, dtype=object))
    print("💾 Stored documents metadata.")

def load_documents():
    if os.path.exists(DOC_STORE_PATH):
        return np.load(DOC_STORE_PATH, allow_pickle=True).tolist()
    return []

def add_documents(docs):
    index = load_faiss()
    stored_docs = load_documents()

    embeddings = model.encode([d["text"] for d in docs])
    index.add(np.array(embeddings, dtype="float32"))

    stored_docs.extend(docs)
    save_documents(stored_docs)
    save_faiss(index)
