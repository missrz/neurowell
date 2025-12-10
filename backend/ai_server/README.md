# AI Server

Minimal RAG demo using FAISS + SentenceTransformers and Google Gemini.

## Repo structure
- `config.py` — configuration constants (embedding model, etc.)
- `main.py` — FastAPI entrypoint
- `rag/` — RAG pipeline, prompts, Gemini client
- `vector_db/` — FAISS index and document storage helpers
- `loaders/` — document loaders (txt, csv, pdf, etc.)
- `chunker/` — text chunking utilities
- `docs/` — sample data files
- `seed.py` — seed script to populate FAISS
- `test_query.py` — interactive query helper

## Prerequisites
- Python 3.10+
- `pip` and virtualenv (or `venv`)
- Google Cloud credentials and Gemini API access

## Setup (recommended)
1. Create and activate virtualenv

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Create env file (recommended)

Create a `.env` in the project root with:

```
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=ya29.your_api_key_here
EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Load it in your shell when working locally:

```bash
set -o allexport; source .env; set +o allexport
```

4. Seed the FAISS index

```bash
python seed.py
```

5. Run a quick query

```bash
python test_query.py
```

6. Run the API server

```bash
uvicorn main:app --host 0.0.0.0 --port 4001 --reload
```

## Notes
- Don't commit API keys. Add `.env` to `.gitignore`.
- The project stores FAISS index files in `faiss.index` and `faiss_docs.npy` in the repo root by default.

## Troubleshooting
- If you encounter model/API errors, verify `GEMINI_API_KEY` and `GEMINI_MODEL` environment values.
- If no documents are found, run `python seed.py` to populate the index.
