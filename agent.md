NeuroWell — Agent Instructions

Purpose
-------
This document gives guidance to an AI assistant (developer/agent) about the NeuroWell repository so it can provide accurate, actionable help.

Repository context
------------------
- Frontend: React app in project root (`src/`, `public/`). Built and served by nginx in Docker.
- Backend: Node/Express in `backend/` — exposes `/api/detect` which proxies to Python AI.
- Python AI service: `backend/python_ai/ai_server.py` — simple Flask app with `/predict` and `/health` endpoints.
- Docker: `docker-compose.yml` orchestrates `frontend`, `backend`, `python-ai` services.

Key endpoints
-------------
- `GET /` (frontend)
- `GET /health` (python-ai)
- `POST /predict` (python-ai) accepts `{ "text": "..." }`
- `POST /api/detect` (backend) proxies to python-ai

Development workflow
--------------------
- Build images: `make build`
- Start stack: `make up`
- Stop stack: `make down`
- View logs: `make logs`

How the assistant should behave
-------------------------------
- Be precise and short: return code patches using the repository path and minimal changes.
- Always check the repo files before suggesting changes.
- Use the existing patterns (React + functional components, Express commonjs) when editing.
- When writing code changes, run local validations where possible (lint/build/test) and report results.

Communication rules
-------------------
- Ask clarifying questions only if necessary.
- When making edits, provide a brief rationale and the exact commands to run to verify.
- If the user asks to run commands, run them and paste relevant output (errors/logs).

Examples of good requests
-------------------------
- "Fix Click error in `src/components/Navbar.jsx` when clicking Home from other routes." 
- "Add a health-check route to Python AI and update compose healthcheck to use it."
- "Make the Hero 'Start Mental Health Check' button require login and redirect to `/login`."

Security and safety
-------------------
- Do not store or print any user secrets. If editing authentication code, do not hardcode credentials.

Acceptable outputs
------------------
- Minimal, ready-to-apply patches
- Short verification commands and brief test results
- Clear next steps

Contact
-------
For unclear tasks, ask the user which environment they want changes applied (local vs Docker).