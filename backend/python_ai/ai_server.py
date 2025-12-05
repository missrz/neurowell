from flask import Flask, request, jsonify

app = Flask(__name__)

def predict_mood(text):
    if "happy" in text.lower():
        return "Happy", 90, "Keep smiling!"
    elif "sad" in text.lower():
        return "Sad", 85, "Talk to someone you trust."
    else:
        return "Neutral", 70, "Maintain a positive mindset."

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("text")
    if not text:
        return jsonify({"error": "Text is required"}), 400

    mood, confidence, advice = predict_mood(text)
    return jsonify({
        "mood": mood,
        "confidence": confidence,
        "advice": advice
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=4001, debug=True)
