import numpy as np
from vector_db.faiss_client import load_faiss, load_documents, model

def test_query():
    index = load_faiss()
    docs = load_documents()

    query = "What is this project about?"
    print(f"❓ Query: {query}")

    q_embed = model.encode([query]).astype("float32")

    k = 3
    distances, indices = index.search(q_embed, k)

    print("\n🔍 Top Matches:")
    for i, idx in enumerate(indices[0]):
        print(f"\n----- Match {i+1} -----")
        print(docs[idx]["text"][:500])

if __name__ == "__main__":
    test_query()
