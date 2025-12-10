import numpy as np
import faiss

from rag.embedder import embed
from vector_db.faiss_client import load_faiss, load_documents

TOP_K = 5

def retrieve_relevant_context(query: str):
    """Search FAISS and return top K doc chunks as context."""

    # Load memory index + docs
    index = load_faiss()
    docs = load_documents()

    if len(docs) == 0:
        return "No documents available in FAISS."

    # Embed query
    query_vec = embed(query).astype("float32").reshape(1, -1)

    # Run FAISS search
    distances, ids = index.search(query_vec, TOP_K)

    results = []
    for idx in ids[0]:
        if idx == -1 or idx >= len(docs):
            continue
        results.append(docs[idx]["text"])

    return "\n".join(results)
