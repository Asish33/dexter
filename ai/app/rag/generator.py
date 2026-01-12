from openai import OpenAI
from app.config import OPENAI_API_KEY, LLM_MODEL
from app.prompts.question import QUESTION_PROMPT

client = OpenAI(api_key=OPENAI_API_KEY)


def clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        # handles ```json ... ```
        text = text.split("```")[1]
    return text.strip()


def generate_questions(
    chunks,
    difficulty: str,
    count: int,
    mode: str,
    options: int | None
):
    context = "\n\n".join(
        f"[{c['source']}]\n{c['text']}" for c in chunks
    )

    prompt = QUESTION_PROMPT.format(
        context=context,
        difficulty=difficulty,
        count=count,
        mode=mode.upper(),
        options=options if options else ""
    )

    res = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict JSON API. "
                    "Return ONLY valid JSON. "
                    "Do not include explanations, markdown, or extra text."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    raw = res.choices[0].message.content
    return clean_json(raw)
