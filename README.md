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

REPL Console / DB Tips
----------------------
You can open a Node REPL that loads your app models and connects to the app database. Use `make console` (or run `node backend/console.js`) to start the REPL inside the backend environment.

Common commands (in the REPL):

- List up to 5 users:
```js
await User.find().limit(5)
```

- List up to 5 users as plain objects (no Mongoose docs):
```js
await User.find().lean().limit(5)
```

- Find a user by MongoDB `_id` (replace `<id>`):
```js
await User.findById('<id>')
// or
await User.findOne({ _id: '<id>' })
```

- Update a user's name (by id):
```js
await User.findByIdAndUpdate('<id>', { name: 'New Name' }, { new: true })
```

- Update a user's password (hashing with bcrypt):
```js
const bcrypt = require('bcrypt');
const newHash = await bcrypt.hash('newPlainPassword', 10);
await User.findByIdAndUpdate('<id>', { passwordHash: newHash });
```

Notes:
- The REPL exposes `User`, `mongoose`, `db`, and `bcrypt` for convenience.
- Use `await` in the Node 18+ REPL to run queries directly.
- For production or admin UIs, never expose `passwordHash` or allow unhashed password storage.

