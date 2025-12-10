from sentence_transformers import SentenceTransformer
from config import EMBED_MODEL

model = SentenceTransformer(EMBED_MODEL)

def embed(text: str):
    """Embed a single query text into a vector."""
    return model.encode([text], convert_to_numpy=True)[0]
