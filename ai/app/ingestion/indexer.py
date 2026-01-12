from app.ingestion.chunker import chunk_text
from app.ingestion.embedder import embed
from app.vectorstore.chroma import collection


def index_document(document_id: str, sections: list[dict]):
    """
    Takes extracted document sections,
    chunks them, embeds them,
    and stores them in the vector database.
    """
    idx = 0

    for section in sections:
        chunks = chunk_text(section["text"])

        for chunk in chunks:
            collection.add(
                ids=[f"{document_id}_{idx}"],
                documents=[chunk],
                metadatas=[{
                    "document_id": document_id,
                    "source": section["source"]
                }],
                embeddings=[embed(chunk)]
            )
            idx += 1
