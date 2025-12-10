import os
from config import SUPPORTED, DOCS_DIR
from loaders.txt_loader import load_txt
from loaders.md_loader import load_md
from loaders.pdf_loader import load_pdf
from loaders.docx_loader import load_docx
from loaders.csv_loader import load_csv
from chunker.text_chunker import chunk_text
from vector_db.faiss_client import add_documents

# Map extension → loader function
LOADERS = {
    ".txt": load_txt,
    ".md": load_md,
    ".pdf": load_pdf,
    ".docx": load_docx,
    ".csv": load_csv
}

def seed():
    docs = []

    print("\n🚀 Starting FAISS seeding...")
    print(f"📂 Scanning docs folder: {DOCS_DIR}\n")

    for filename in os.listdir(DOCS_DIR):
        ext = os.path.splitext(filename)[1].lower()

        if ext not in SUPPORTED:
            print(f"❌ Skipped (unsupported): {filename}")
            continue

        file_path = os.path.join(DOCS_DIR, filename)
        print(f"📄 Processing: {filename}")

        loader = LOADERS[ext]
        text = loader(file_path)

        chunks = chunk_text(text)
        print(f"   ➜ {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            docs.append({
                "id": f"{filename}_{i}",
                "text": chunk
            })

    if docs:
        print("\n🔄 Embedding & Storing in FAISS...")
        add_documents(docs)
    else:
        print("⚠️ No documents to process.")

    print("\n✅ DONE: FAISS vector database seeded!\n")


if __name__ == "__main__":
    seed()
