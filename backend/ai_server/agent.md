# Agent Guide

This document explains how an automated agent (Copilot / operator) should interact with this repository.

Responsibilities
- Keep secrets out of commits. If a key appears, remove it and instruct the user to rotate keys.
- Prefer minimal, surgical code changes and document them.
- Run `python test_query.py` and basic smoke tests after edits.

Local dev flow
1. Activate virtualenv
2. Ensure env vars are set (`GEMINI_API_KEY`, `GEMINI_MODEL`, `EMBED_MODEL`)
3. Run `python seed.py` if FAISS is empty
4. Run `python test_query.py` or `uvicorn main:app --reload`

When editing RAG logic
- Add targeted unit tests if you change core behaviors
- Keep `retrieve_context` resilient to malformed stored documents
- Use `GEMINI_MODEL` env var (do not hardcode model strings)

Error handling
- Surface clear errors for quota and API errors
- Avoid returning raw exception traces to end users

Security
- Mark `.env` and `.venv` in `.gitignore`
- Recommend secrets be stored in a secure secret manager for production
