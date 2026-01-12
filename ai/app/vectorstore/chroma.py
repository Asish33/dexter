import chromadb
from app.config import VECTOR_DB_PATH, COLLECTION_NAME

client = chromadb.PersistentClient(path=VECTOR_DB_PATH)

collection = client.get_or_create_collection(COLLECTION_NAME)
