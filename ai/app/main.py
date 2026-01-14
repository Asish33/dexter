from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json

from app.models import (
    GenerateRequest, 
    GenerateResponse, 
    IngestUrlRequest, 
    RefineRequest,
    BatchRefineRequest
)
from app.ingestion.loader import load_pdf, load_ppt, load_website
from app.ingestion.indexer import index_document
from app.rag.retriever import retrieve
from app.rag.generator import generate_questions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    document_id: str = Form(None)
):
    if not document_id:
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


@app.post("/ingest/url")
def ingest_url(req: IngestUrlRequest):
    print(f"[DEBUG] Ingesting URL: {req.url} with ID: {req.document_id}")
    sections = load_website(req.url)
    
    if not sections:
         print("[DEBUG] No sections loaded")
         raise HTTPException(
            status_code=400,
            detail="Failed to scrape content from URL"
        )
    
    print(f"[DEBUG] Sections loaded: {len(sections)}")
    index_document(req.document_id, sections)
    return {"status": "success", "document_id": req.document_id}


@app.post("/refine")
def refine(req: RefineRequest):
    from app.rag.generator import refine_question
    
    try:
        updated_question = refine_question(req.original_question, req.instruction)
        return updated_question
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/refine-batch")
def refine_batch(req: BatchRefineRequest):
    from app.rag.generator import batch_refine_questions
    
    try:
        updated_questions = batch_refine_questions(req.questions, req.instruction)
        return {"questions": updated_questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):

    if req.mode == "mcq" and not req.options:
        raise HTTPException(
            status_code=400,
            detail="options is required when mode is mcq"
        )

    chunks = retrieve(req.document_id, k=6)
    
    print(f"[DEBUG] Retrieved {len(chunks)} chunks for ID {req.document_id}")
    for i, c in enumerate(chunks):
        print(f"[DEBUG] Chunk {i}: {c['text'][:50]}...")

    if not chunks:
         raise HTTPException(
            status_code=400,
            detail="Insufficient context found in the document. The document might be empty or content extraction failed."
        )

    raw = generate_questions(
        chunks=chunks,
        difficulty=req.difficulty,
        count=req.count,
        mode=req.mode,
        options=req.options,
        topic=req.topic
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