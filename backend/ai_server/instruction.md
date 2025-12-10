# Setup & Developer Instructions

This file contains step-by-step instructions for setting up the project locally and common development commands.

1. Clone repo

```bash
git clone <repo>
cd ai_server
```

2. Create and activate virtualenv

```bash
python -m venv .venv
source .venv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Create `.env` (do not commit)

```
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=ya29.your_api_key_here
EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Load it with:

```bash
set -o allexport; source .env; set +o allexport
```

5. Seed FAISS

```bash
python seed.py
```

6. Quick test

```bash
python test_query.py
```

7. Run server

```bash
uvicorn main:app --reload
```

Maintenance
- Rotate API keys regularly and update `.env`.
- Keep `requirements.txt` up to date with `pip freeze > requirements.txt` when adding deps.
