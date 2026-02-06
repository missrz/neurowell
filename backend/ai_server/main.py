from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from rag.rag_pipeline import get_answer
from fastapi.responses import JSONResponse
import requests
import re
import os
import json
from rag.gemini_client import ask_gemini

app = FastAPI(title="NeuroWell Vector Indexer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
def chat(data: dict):
    user_query = data.get("query", "") or data.get("question", "") or data.get("message", "")
    print("User query:", user_query)
    print("Type of user query:", type(user_query))
    print("User query repr:", data)
    answer = get_answer(user_query)

    # If the answer is an error dictionary
    if isinstance(answer, dict) and "error" in answer:
        return JSONResponse(
            status_code=429 if answer["error"] == "RATE_LIMIT" else 400,
            content=answer
        )
    print("Answer:", answer)

    return {"answer": answer}


def predict_mood(text: str):
    if "happy" in text.lower():
        return "Happy", 90, "Keep smiling!"
    elif "sad" in text.lower():
        return "Sad", 85, "Talk to someone you trust."
    else:
        return "Neutral", 70, "Maintain a positive mindset."


@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    text = data.get("text")
    if not text:
        return JSONResponse({"error": "Text is required"}, status_code=400)

    mood, confidence, advice = predict_mood(text)
    return {"mood": mood, "confidence": confidence, "advice": advice}


def _call_gemini_and_extract(text: str):
    # Build prompt expected by our gemini client/helper
    prompt = (
        "Analyze the text below and return ONLY a valid JSON object. "
        "Do NOT include explanations, markdown, or extra text.\n\n"

        "Rules:\n"
        "1. mood must be exactly one of: Happy, Sad, Neutral.\n"
        "2. If the text expresses sadness, anger, frustration, stress, fear, or negativity, "
        "confidence MUST be low (0–3).\n"
        "3. If the text is neutral or factual with no emotion, confidence should be mid (4–6).\n"
        "4. Only clearly positive, optimistic, or confident text may receive high confidence (7–10).\n"
        "5. confidence must be an integer between 0 and 10.\n"
        "6. advice must be practical, empathetic, and specific to the mood and situation. "
        "Avoid generic advice like 'stay positive'.\n\n"

        "Output JSON format:\n"
        '{ "mood": "Happy|Sad|Neutral", "confidence": 0-10, "advice": "string" }\n\n'

        f'Text: "{str(text).replace("\"", "\\\"")}"'
    )
    # Prefer using the locally provided gemini client library
    raw_response_text = None
    parsed = None
    try:
        # ask_gemini returns a plain string response
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        print(GEMINI_API_KEY)
        raw_response_text = ask_gemini(prompt)
    except Exception as e:
        # If library call fails, try the HTTP GEMINI_URL fallback
        GEMINI_URL = os.environ.get('GEMINI_URL')
        GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
        if GEMINI_URL:
            headers = {"Content-Type": "application/json"}
            if GEMINI_API_KEY:
                headers["Authorization"] = f"Bearer {GEMINI_API_KEY}"
            resp = requests.post(GEMINI_URL, json={"prompt": prompt}, headers=headers, timeout=15)
            try:
                parsed = resp.json()
            except Exception:
                raw_response_text = resp.text
        else:
            # Do not raise here; return a helpful error object so the /score endpoint can surface it cleanly.
            parsed = {"error": f"Gemini client failed: {e}", "hint": "Set a valid GEMINI_API_KEY or configure GEMINI_URL fallback"}

    candidates = []
    if parsed:
        candidates.append(parsed)
        for k in ["output_text", "answer", "result", "candidates", "choices", "output"]:
            if k in parsed:
                candidates.append(parsed[k])
    if raw_response_text:
        candidates.append(raw_response_text)

    found = None
    for c in candidates:
        if c is None:
            continue
        if isinstance(c, dict):
            found = c
            break
        s = c if isinstance(c, str) else json.dumps(c)
        m = re.search(r"\{[\s\S]*\}", s)
        if m:
            try:
                found = json.loads(m.group(0))
                break
            except Exception:
                continue

    confidence = None
    if isinstance(found, dict) and 'confidence' in found:
        confidence = found.get('confidence')
    elif isinstance(parsed, dict) and 'confidence' in parsed:
        confidence = parsed.get('confidence')

    try:
        if confidence is not None:
            confidence = float(confidence)
            if 0 <= confidence <= 1:
                confidence = confidence * 100
            confidence = round(confidence, 2)
    except Exception:
        confidence = None

    return confidence, found or parsed or raw_response_text


@app.post('/score')
async def score_endpoint(request: Request):
    """Simple endpoint: accept JSON {"prompt": "..."} and return {"score": <number>, "raw": ...}

    Requires `GEMINI_URL` (and optional `GEMINI_API_KEY`) in env.
    """
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    prompt = payload.get('prompt') or payload.get('text') or payload.get('mood') or payload.get('journal')
    if not prompt:
        return JSONResponse({"error": "prompt (or text) required"}, status_code=400)

    try:
        score, raw = _call_gemini_and_extract(str(prompt))
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"score": score, "raw": raw}
