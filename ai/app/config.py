import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

VECTOR_DB_PATH = "data/chroma"
COLLECTION_NAME = "documents"
