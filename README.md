NeuroWell - Docker Quick Start

Run these commands to build and start everything with Docker:

```bash
# Build images
make build

# Start services in background
make up

# View logs
make logs

# Stop and remove
make down
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Python AI: http://localhost:5001

AI Assistant Tips
-----------------
- **Quick prompts:** Ask the assistant to "run the stack and show logs", "explain why /api/detect returns 500", or "add auth middleware to backend".
- **Provide context:** When asking about UI or code, mention the file path (for example: `src/components/Hero.jsx`) and the behavior you expect.
- **Testing AI endpoints:** Use `curl -X POST http://localhost:5000/api/detect -d '{"text":"I feel sad"}' -H 'Content-Type: application/json'`.

Files added for AI support:
- `agent.md` — instructions and repository context for AI helpers.
- `insta.md` — short templates and examples for Instagram content generation.
