from app.config import CHUNK_SIZE, CHUNK_OVERLAP

def chunk_text(text: str):
    words = text.split()
    chunks = []

    start = 0
    while start < len(words):
        end = start + CHUNK_SIZE
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks
