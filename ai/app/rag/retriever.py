from app.ingestion.embedder import embed
from app.vectorstore.chroma import collection

def retrieve(document_id: str, k: int = 6):
    res = collection.get(
        where={"document_id": document_id},
        limit=k
    )

    docs = []
    for doc, meta in zip(res["documents"], res["metadatas"]):
        docs.append({
            "text": doc,
            "source": meta["source"]
        })

    return docs
