# rag/prompts.py
"""
Prompt builder for RAG pipeline.

Provides:
- build_rag_prompt(question, context, instructions=None, max_context_chars=3000)

Behavior:
- Keeps the tail of the retrieved context up to max_context_chars (so the most recent/relevant text is used).
- Sanitizes whitespace.
- Returns a single string prompt ready to be passed to the LLM.
"""

import re
from typing import Optional

DEFAULT_INSTRUCTIONS = (
    "You are a helpful assistant. Answer concisely and only using the provided context. "
    "If the answer is not present in the context, say: 'I don't know based on the provided documents.' "
    "When you include information from the context, provide short citations in the form [source_name]."
)

def _sanitize(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()
    return text

def _tail_truncate(text: str, max_chars: int) -> str:
    """Keep the last max_chars of the text (preserve boundaries if possible)."""
    if not text:
        return ""
    if len(text) <= max_chars:
        return text
    # Attempt to cut at a newline boundary near the start of the tail for cleaner context
    tail = text[-max_chars:]
    nl_pos = tail.find("\n")
    if nl_pos > 0 and nl_pos < max_chars // 10:
        # if the first newline in the tail is very early, strip up to it to avoid broken paragraph
        tail = tail[nl_pos+1:]
    return tail

def build_rag_prompt(question: str, context: str, instructions: Optional[str] = None, max_context_chars: int = 3000) -> str:
    """
    Build a single prompt for the LLM using question and retrieved context.

    Args:
      question: user's question.
      context: concatenated retrieved document chunks (string).
      instructions: optional system instructions override.
      max_context_chars: maximum characters to include from the context (tail kept).

    Returns:
      prompt string
    """
    instructions = instructions or DEFAULT_INSTRUCTIONS
    q = _sanitize(question)
    ctx = _sanitize(context)
    ctx_trunc = _tail_truncate(ctx, max_context_chars)

    prompt = f"""System instructions:
{instructions}

Context (only use the information below to answer). If context is empty, say you don't know.
--- CONTEXT START ---
{ctx_trunc}
--- CONTEXT END ---


User question:
{q}

Answer (be concise). If you must add assumptions, label them clearly with "Assumption:".
"""
    return prompt
