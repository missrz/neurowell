from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from rag.rag_pipeline import get_answer
from fastapi.responses import JSONResponse

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
