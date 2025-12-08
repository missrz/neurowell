from sentence_transformers import SentenceTransformer
import chromadb

model = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.Client()

collection = client.get_collection("neuro_dataset")

def search(query):
    query_emb = model.encode(query).tolist()
    
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=5
    )
    
    return results

print(search("What are signs of depression?"))
