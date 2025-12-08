# NeuroWell Copilot Instructions

## Repository Architecture
- **Frontend**: React app in `src/`, static assets in `public/`. Built and served via nginx (see `frontend.Dockerfile`, `nginx.conf`).
- **Backend**: Node.js/Express in `backend/`. Main API endpoint: `/api/detect` (proxies to Python AI).
- **Python AI Service**: Flask app in `backend/python_ai/ai_server.py` with `/predict` and `/health` endpoints. Receives text for prediction.
- **Orchestration**: All services run via Docker Compose (`docker-compose.yml`).

## Developer Workflows
- **Build all images**: `make build`
- **Start all services**: `make up`
- **View logs**: `make logs`
- **Stop and clean up**: `make down`
- **REPL Console**: `make console` or `node backend/console.js` for direct DB/model access.

## Patterns & Conventions
- **Frontend**: Use React functional components, CSS modules in `src/styles/`. Organize features in `src/components/` and pages in `src/pages/`.
- **Backend**: Use CommonJS (`require`/`module.exports`). Models in `backend/models/`, routes in `backend/routes/`. API endpoints proxy to Python AI for predictions.
- **Python AI**: Flask app, endpoints `/predict` (POST JSON `{text: ...}`) and `/health`.
- **Testing AI endpoints**: Example: `curl -X POST http://localhost:5000/api/detect -d '{"text":"I feel sad"}' -H 'Content-Type: application/json'`

## Integration Points
- **Backend ↔ Python AI**: `/api/detect` (Express) proxies to `/predict` (Flask).
- **Frontend ↔ Backend**: React app calls backend API endpoints for predictions and user management.

## Examples
- **REPL DB Query** (in console):
  ```js
  await User.find().limit(5)
  await User.findById('<id>')
  ```
- **Password Hashing**:
  ```js
  const bcrypt = require('bcrypt');
  const newHash = await bcrypt.hash('newPlainPassword', 10);
  await User.findByIdAndUpdate('<id>', { passwordHash: newHash });
  ```

## AI Agent Guidance
- Always check repo files before suggesting changes.
- Use existing patterns (React functional, Express CommonJS, Flask) for edits.
- Run local validations (lint/build/test) and report results.
- Ask clarifying questions only if necessary.
- When making edits, provide rationale and exact verification commands.
- For commands, run and paste relevant output (errors/logs).

---
For more context, see `agent.md` and `README.md`.