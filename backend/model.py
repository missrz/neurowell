import sys
import json

text = " ".join(sys.argv[1:]).lower()

mood = "Neutral"
confidence = 70
advice = "Maintain balance and stay consistent."

if any(word in text for word in ["sad", "depressed", "down", "tired"]):
    mood = "Sad"
    confidence = 92
    advice = "Talk to someone you trust, take rest and avoid isolation."

elif any(word in text for word in ["happy", "excited", "joy", "great"]):
    mood = "Happy"
    confidence = 95
    advice = "Keep enjoying your positive moments!"

elif any(word in text for word in ["angry", "frustrated", "irritated"]):
    mood = "Angry"
    confidence = 88
    advice = "Try breathing exercises and take a break."

elif any(word in text for word in ["anxious", "scared", "nervous"]):
    mood = "Anxious"
    confidence = 90
    advice = "Practice grounding techniques and slow breathing."

result = {
    "mood": mood,
    "confidence": confidence,
    "advice": advice
}

print(json.dumps(result))
