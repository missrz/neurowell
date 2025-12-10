# rag/rag_pipeline.py

import numpy as np
from typing import List
from config import EMBED_MODEL
from sentence_transformers import SentenceTransformer

from vector_db.faiss_client import load_faiss, load_documents
from rag.prompts import build_rag_prompt
from rag.gemini_client import ask_gemini


# Load embedder once to avoid slow reloads
encoder = SentenceTransformer(EMBED_MODEL)


def _embed(text: str) -> np.ndarray:
    """Return embedding as float32 vector."""
    emb = encoder.encode([text])[0]
    return np.array(emb, dtype="float32")


# Simple small-talk detector: bypass RAG for short conversational queries
SMALL_TALK = {
    # Basic greetings
    "hi", "hello", "hey", "yo", "hi there", "hello there", "hey there",

    # Casual variations
    "hey buddy", "hey bro", "hey man", "hey dude",
    "what's up", "whats up", "sup", "wsup",
    "good morning", "good afternoon", "good evening",

    # Friendly openers
    "how are you", "how r u", "how's it going", "hows it going",
    "how are things", "how's everything", "hows everything",

    # Very common slang
    "yo man", "yo bro", "yo buddy",
    "hi buddy", "hi bro",

    # Super short conversational starters
    "hi!", "hello!", "hey!", "yo!",

    # Polite openers
    "greetings", "salutations",

    # Chill expressions used as greetings
    "what's good", "whats good", "what's new", "whats new",
    "long time no see",

    # Emoji-based greetings (very common from frontends)
    "👋", "🙏", "🙌", "😊", "🙂"
}

def is_small_talk(text: str) -> bool:
    clean = (text or "").lower().strip()
    return clean in SMALL_TALK


def retrieve_context(query: str, k: int = 5) -> str:
    """
    Retrieve top-k similar document chunks.
    Returns a single concatenated string.
    """

    index = load_faiss()
    documents = load_documents()

    if index.ntotal == 0 or len(documents) == 0:
        return ""

    query_emb = _embed(query).reshape(1, -1)
    distances, indices = index.search(query_emb, k)

    chunks: List[str] = []

    for idx in indices[0]:
        # FAISS may return -1 for empty slots; skip invalid indices
        if idx is None or idx < 0 or idx >= len(documents):
            continue

        doc = documents[idx]

        # Support dict-shaped documents or plain strings
        if isinstance(doc, dict):
            text = doc.get("text") or ""
            source = doc.get("source") or doc.get("source_path") or "<unknown>"
        else:
            text = str(doc)
            source = "<unknown>"

        if not text:
            continue

        chunks.append(f"[source: {source}] {text}")

    return "\n\n".join(chunks)


def get_answer(question: str) -> str:
    """
    Core RAG pipeline:
    1. Retrieve context
    2. Build prompt
    3. Query Gemini
    4. Fallbacks & error handling
    """

    # If the query is small-talk, bypass retrieval and ask Gemini directly
    print("Question:", question)
    print("Is small talk:", is_small_talk(question))
    if is_small_talk(question):
        try:
            return ask_gemini(question)
        except Exception as e:
            err = str(e)
            if "429" in err or "quota" in err.lower():
                return (
                    "Gemini API quota exhausted. Please try again later "
                    "or upgrade your plan."
                )
            return f"RAG pipeline failed: {err}"

    # 1. Retrieve docs
    context = retrieve_context(question)

    # 2. Build prompt
    prompt = build_rag_prompt(question=question, context=context)

    # 3. Ask Gemini (with error handling)
    try:
        response = ask_gemini(prompt)
        return response

    except Exception as e:
        err = str(e)

        if "429" in err or "quota" in err.lower():
            return (
                "Gemini API quota exhausted. Please try again later "
                "or upgrade your plan."
            )

        return f"RAG pipeline failed: {err}"
