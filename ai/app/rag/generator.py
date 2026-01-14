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

    return text.strip()


def sanitize_input(text: str | None) -> str:
    if not text:
        return ""
    # Basic injection patterns
    patterns = [
        "ignore previous instructions",
        "ignore all instructions",
        "system override",
        "you are a teapot",
    ]
    cleaned = text
    for p in patterns:
        cleaned = cleaned.replace(p, "[REDACTED]")
        cleaned = cleaned.replace(p.upper(), "[REDACTED]")
        cleaned = cleaned.replace(p.title(), "[REDACTED]")
    return cleaned.strip()
def validate_questions(questions: list[dict]) -> list[dict]:
    """
    Guardrail: Validates logical integrity of generated questions.
    Filters out questions that fail these checks:
    1. 'correct_answer' must exist in 'options' (for MCQ).
    2. 'options' must have at least 2 items (for MCQ).
    3. Mandatory fields must not be empty.
    """
    valid_questions = []

    for idx, q in enumerate(questions):
        try:
            q_type = q.get("type", "mcq").lower()

            # GLOBAL CHECKS
            if not q.get("question") or not q.get("correct_answer"):
                print(f"[WARN] Guardrail: Dropping Q{idx+1} due to missing fields.")
                continue

            # MCQ / TRUE_FALSE SPECIFIC CHECKS
            if q_type in ["mcq", "true_false", "mixed"]:
                options = q.get("options", [])
                correct = q.get("correct_answer")

                if not isinstance(options, list) or len(options) < 2:
                    print(f"[WARN] Guardrail: Dropping Q{idx+1} due to insufficient options.")
                    continue
                
                # Check if correct answer is in options (loose string match)
                # We stripe whitespace and lower case for robust comparison
                normalized_options = [str(o).strip().lower() for o in options]
                normalized_correct = str(correct).strip().lower()

                if normalized_correct not in normalized_options:
                     print(f"[WARN] Guardrail: Dropping Q{idx+1} - Correct answer '{correct}' not found in options {options}.")
                     continue
            
            # CONTENT SAFETY CHECK (Basic List)
            # In production, use a library like `better-profanity` or an API.
            blocklist = ["damn", "hell", "fuck", "shit", "bitch"] # Add more as needed
            combined_text = (q.get("question", "") + " " + q.get("answer", "") + " " + q.get("explanation", "")).lower()
            
            if any(bad in combined_text for bad in blocklist):
                 print(f"[WARN] Guardrail: Dropping Q{idx+1} due to profanity/unsafe content.")
                 continue

            valid_questions.append(q)

        except Exception as e:
            print(f"[ERROR] Guardrail verification failed for Q{idx+1}: {e}")
            continue

    print(f"[DEBUG] Guardrail: {len(valid_questions)}/{len(questions)} questions passed validation.")
    return valid_questions

def generate_questions(
    chunks,
    difficulty: str,
    count: int,
    mode: str,
    options: int | None,
    topic: str | None = None
):
    # Guardrail: Sanitize Inputs
    topic = sanitize_input(topic)
    # Difficulty is an enum in pydantic, but good to be safe if passed as str
    difficulty = sanitize_input(difficulty)

    context = "\n\n".join(
        f"[{c['source']}]\n{c['text']}" for c in chunks
    )

    topic_instruction = f"IMPORTANT: The user wants to focus specifically on these topics: {topic}. Prioritize generating questions related to this." if topic else ""

    prompt = QUESTION_PROMPT.format(
        context=context,
        difficulty=difficulty,
        count=count,
        mode=mode.upper(),
        options=options if options else "",
        topic_instruction=topic_instruction
    )

    import json
    import time
    
    MAX_RETRIES = 3
    
    print(f"[DEBUG] PROMPT:\n{prompt}\n[DEBUG] END PROMPT")

    for attempt in range(MAX_RETRIES):
        try:
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
                response_format={"type": "json_object"},
                temperature=0.2
            )

            raw = res.choices[0].message.content
            cleaned = clean_json(raw)
            
            # Verify it's valid JSON before returning
            parsed = json.loads(cleaned)
            
            final_questions_list = []

            # If we used strict mode, it returns {"questions": [...]}. Unwrap it.
            if isinstance(parsed, dict) and "questions" in parsed:
                final_questions_list = parsed["questions"]
            elif isinstance(parsed, list):
                final_questions_list = parsed
            else:
                 # Should not happen with strict mode + correct prompt, but fallback
                 print("[WARN] Unexpected JSON structure, returning raw parse.")
                 return cleaned

            # Apply Guardrails
            validated = validate_questions(final_questions_list)
            
            # If we lost too many questions (e.g. > 50%), maybe we should retry?
            # For now, let's just return what we have to be safe and fast.
            return json.dumps(validated)

        except json.JSONDecodeError:
            print(f"[WARN] LLM returned invalid JSON (attempt {attempt+1}). Retrying...")
            if attempt < MAX_RETRIES - 1:
                time.sleep(1)
        except Exception as e:
             print(f"[ERROR] LLM generation error: {e}")
             if "rate_limit" in str(e).lower():
                 time.sleep(5) # Wait longer for rate limits
             elif attempt < MAX_RETRIES - 1:
                 time.sleep(1)
             else:
                 raise e

    raise Exception("Failed to generate valid JSON after retries")


def refine_question(original_question: dict, instruction: str):
    from app.prompts.refine import REFINE_PROMPT
    import json
    
    prompt = REFINE_PROMPT.format(
        original_question=json.dumps(original_question, indent=2),
        instruction=instruction
    )

    try:
        res = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON API. Return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        cleaned = clean_json(res.choices[0].message.content)
        return json.loads(cleaned)
    except Exception as e:
        print(f"[ERROR] Refinement failed: {e}")
        raise e


def batch_refine_questions(questions: list[dict], instruction: str):
    """
    Refines multiple questions in parallel.
    Doing this in parallel is much faster than sequential.
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    updated_questions = [None] * len(questions)
    
    # Helper to keep track of index
    def process(idx, q):
        try:
            return idx, refine_question(q, instruction)
        except Exception as e:
            print(f"[ERROR] Batch refine failed for q {idx}: {e}")
            return idx, q # Return original on failure

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process, i, q) for i, q in enumerate(questions)]
        
        for future in as_completed(futures):
            idx, res = future.result()
            updated_questions[idx] = res

    return updated_questions
