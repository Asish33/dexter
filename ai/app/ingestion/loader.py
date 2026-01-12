import pdfplumber
from pptx import Presentation

def load_pdf(path: str):
    pages = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages.append({
                    "source": f"page_{i+1}",
                    "text": text
                })
    return pages


def load_ppt(path: str):
    prs = Presentation(path)
    slides = []

    for i, slide in enumerate(prs.slides):
        content = []
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                content.append(shape.text)

        if content:
            slides.append({
                "source": f"slide_{i+1}",
                "text": " ".join(content)
            })

    return slides
