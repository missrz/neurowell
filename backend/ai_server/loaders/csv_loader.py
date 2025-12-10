import pandas as pd

def load_csv(path):
    # Try common delimiters
    possible_delimiters = [",", ";", "\t", "|"]

    for delim in possible_delimiters:
        try:
            df = pd.read_csv(path, delimiter=delim, encoding="utf-8", engine="python")
            break
        except Exception:
            df = None

    # Try fallback encodings
    if df is None:
        fallback_encodings = ["latin1", "cp1252"]
        for enc in fallback_encodings:
            try:
                df = pd.read_csv(path, delimiter=delim, encoding=enc, engine="python")
                break
            except Exception:
                df = None

    if df is None:
        raise Exception(f"❌ Could not read CSV file: {path}")

    # Convert CSV rows into plain text lines
    text_lines = []

    for _, row in df.iterrows():
        row_text = " | ".join([str(v) for v in row.values])
        text_lines.append(row_text)

    return "\n".join(text_lines)
