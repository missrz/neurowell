import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from google.api_core.exceptions import GoogleAPICallError


# Read configuration from environment with sensible defaults
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print(GEMINI_API_KEY)



def ask_gemini(prompt: str) -> str:
    """Send `prompt` to Gemini and return text. Reads model from `GEMINI_MODEL`.

    Returns a plain string on success or raises an exception on failure so callers
    can handle errors consistently.
    """
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)

        # response.text is expected; coerce to str for safety
        return str(response.text)

    except ResourceExhausted as e:
        raise RuntimeError("Gemini quota exceeded") from e

    except GoogleAPICallError as e:
        raise RuntimeError(f"Gemini API error: {e}") from e

    except Exception as e:
        raise RuntimeError(f"Gemini unknown error: {e}") from e
