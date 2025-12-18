python set-up 
    1> python3 -m venv .venv
    2> source .venv/bin/activate
    3> pip install -r requirements.txt
    4> Create a `.env` in the project root with:
            ```
            GEMINI_MODEL=gemini-2.5-flash
            GEMINI_API_KEY=ya29.your_api_key_here
            EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2
            ```
    3> set -o allexport; source .env; set +o allexport
    5> python3 seed.py # seed data set into fassi index data
    6> Run a quick query
        ```bash
        python3 test_query.py
        ```
    7> Run the API server
        ```bash
        uvicorn main:app --host 0.0.0.0 --port 4001 --reload
        ```

node backend
    1> npm install --omit=dev --no-audit --no-fund
    2> node server.js

Frontend setup:
    1> npm install
    2> npm start

mongo db:
    1> install and start