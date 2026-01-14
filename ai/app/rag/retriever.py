from app.ingestion.embedder import embed
from app.vectorstore.chroma import collection

def retrieve(document_id: str, k: int = 6):
    print(f"[DEBUG] Retrieving docs for ID: {document_id}")
    # Get all documents for the specific document_id
    all_docs = collection.get(
        where={"document_id": document_id}
    )
    print(f"[DEBUG] Found {len(all_docs.get('documents', []))} matching docs in Chroma")

    # If we have more documents than k, try to sample them evenly across sources
    # to ensure coverage of the entire document
    docs = []
    if len(all_docs["documents"]) <= k:
        # If we have fewer docs than k, return all of them
        for doc, meta in zip(all_docs["documents"], all_docs["metadatas"]):
            docs.append({
                "text": doc,
                "source": meta["source"]
            })
    else:
        # If we have more docs than k, try to get even distribution across sources
        # Sort by source to group similar sources together
        sorted_items = sorted(
            zip(all_docs["documents"], all_docs["metadatas"]),
            key=lambda x: x[1]["source"]
        )

        # Select evenly spaced items to cover the whole document
        step = len(sorted_items) // k
        selected_indices = [i * step for i in range(k)]

        for i in selected_indices:
            if i < len(sorted_items):  # Safety check
                doc, meta = sorted_items[i]
                if doc and len(doc.strip()) > 50: # Ensure chunk has meaningful content
                    docs.append({
                        "text": doc,
                        "source": meta["source"]
                    })

    return docs
