import chromadb
from app.config import VECTOR_DB_PATH, COLLECTION_NAME

# Connect to local Chroma (persistent)
import os
DB_DIR = os.path.join(os.path.dirname(__file__), "../../chroma_db")
client = chromadb.PersistentClient(path=DB_DIR)

collection = client.get_or_create_collection(COLLECTION_NAME)
