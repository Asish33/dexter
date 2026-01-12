from fastapi import FastAPI, UploadFile, File
import uuid
import json

from app.models import GenerateRequest, GenerateResponse
from app.ingestion.loader import load_pdf, load_ppt
from app.ingestion.indexer import index_document
from app.rag.retriever import retrieve
from app.rag.generator import generate_questions

app = FastAPI()

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    document_id = str(uuid.uuid4())
    path = f"/tmp/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    if file.filename.endswith(".pdf"):
        sections = load_pdf(path)
    elif file.filename.endswith(".pptx"):
        sections = load_ppt(path)
    else:
        return {"error": "Unsupported file type"}

    index_document(document_id, sections)

    return {"document_id": document_id}


from fastapi import HTTPException
import json

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):

    if req.mode == "mcq" and not req.options:
        raise HTTPException(
            status_code=400,
            detail="options is required when mode is mcq"
        )

    chunks = retrieve(req.document_id, k=6)

    raw = generate_questions(
        chunks=chunks,
        difficulty=req.difficulty,
        count=req.count,
        mode=req.mode,
        options=req.options
    )

    print("RAW LLM OUTPUT ↓↓↓")
    print(raw)
    print("↑↑↑ RAW LLM OUTPUT")

    if "insufficient context" in raw.lower():
         raise HTTPException(
            status_code=400,
            detail="Insufficient context provided in the document"
        )

    try:
        questions = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="LLM returned invalid JSON"
        )

    return {"questions": questions}