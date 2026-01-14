from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class GenerateRequest(BaseModel):
    document_id: str
    difficulty: Literal["easy", "medium", "hard"]
    count: int = Field(gt=0, le=50)
    mode: Literal["text", "mcq", "true_false", "mixed"]
    options: Optional[int] = Field(default=None, ge=2, le=6)
    topic: Optional[str] = None


class IngestUrlRequest(BaseModel):
    url: str
    document_id: str


class TextQuestion(BaseModel):
    question: str
    answer: str
    explanation: Optional[str] = None
    source: str


class MCQQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    source: str


class GenerateResponse(BaseModel):
    questions: List[dict]


class RefineRequest(BaseModel):
    original_question: dict
    instruction: str


class BatchRefineRequest(BaseModel):
    questions: List[dict]
    instruction: str

