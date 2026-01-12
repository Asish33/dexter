from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class GenerateRequest(BaseModel):
    document_id: str
    difficulty: Literal["easy", "medium", "hard"]
    count: int = Field(gt=0, le=20)
    mode: Literal["text", "mcq"]
    options: Optional[int] = Field(default=None, ge=2, le=6)


class TextQuestion(BaseModel):
    question: str
    answer: str
    source: str


class MCQQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    source: str


class GenerateResponse(BaseModel):
    questions: List[dict]
