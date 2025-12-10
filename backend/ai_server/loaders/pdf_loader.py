import pypdf

def load_pdf(path):
    reader = pypdf.PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text
