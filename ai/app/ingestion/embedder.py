from openai import OpenAI
from app.config import OPENAI_API_KEY, EMBEDDING_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)

def embed(text: str) -> list[float]:
    res = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    return res.data[0].embedding
