import os
from dotenv import load_dotenv

load_dotenv()

# File types supported for ingestion
SUPPORTED = [".txt", ".md", ".pdf", ".docx", ".csv"]

# Where your raw documents will be stored
DOCS_DIR = "docs"

# Embedding model
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in environment variables")
