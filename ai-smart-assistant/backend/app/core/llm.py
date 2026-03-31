import os
import json
import re
from urllib import request, error
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from the repo root `.env` (if present).
# This makes `OPENAI_API_KEY` work without manually exporting vars.
_ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(_ROOT_DIR / ".env")

api_key = os.getenv("OPENAI_API_KEY", "")
client = OpenAI(api_key=api_key) if api_key else None

SYSTEM_PROMPT = (
    "You are a smart AI assistant. "
    "You ALWAYS have access to conversation history provided in prior messages. "
    "Never claim you cannot remember if the information is present in history. "
    "Answer follow-up questions consistently using the previous turns."
)

def _extract_user_name(history: list[dict], prompt: str) -> str | None:
    text_chunks = [str(item.get("content", "")) for item in history if item.get("role") == "user"]
    text_chunks.append(prompt)
    text = "\n".join(text_chunks)
    m = re.search(r"\bmy name is\s+([A-Za-z][A-Za-z\s'-]{0,40})", text, flags=re.IGNORECASE)
    if not m:
        return None
    return m.group(1).strip().rstrip(".!?")

def _ask_ollama(messages: list[dict]) -> str:
    """Query local Ollama server."""
    base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")

    payload = {"model": model, "messages": messages, "stream": False}
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url=f"{base_url}/api/chat",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with request.urlopen(req, timeout=60) as res:
        data = json.loads(res.read().decode("utf-8"))
        return str(data.get("message", {}).get("content", "")).strip()

def ask_llm(prompt: str, history: list[dict] | None = None) -> str:
    """Query LLM with prompt"""
    history = history or []
    # Keep a larger rolling context for long conversations.
    trimmed_history = []
    for item in history[-40:]:
        role = item.get("role")
        content = str(item.get("content", "")).strip()
        if role in {"user", "assistant"} and content:
            trimmed_history.append({"role": role, "content": content})

    facts = []
    maybe_name = _extract_user_name(trimmed_history, prompt)
    if maybe_name:
        facts.append(f"The user's name is {maybe_name}.")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if facts:
        messages.append({"role": "system", "content": "Known facts:\n- " + "\n- ".join(facts)})
    messages.extend(trimmed_history)
    messages.append({"role": "user", "content": prompt})

    # 1) Prefer local Ollama for a no-cost setup.
    try:
        ollama_response = _ask_ollama(messages)
        if ollama_response:
            return ollama_response
    except (error.URLError, TimeoutError):
        # Ollama is not running/reachable, continue to OpenAI fallback.
        pass
    except Exception:
        # Any unexpected local-model failure should not crash chat.
        pass

    # 2) Fallback to OpenAI if configured.
    if not client:
        return (
            "No model backend is available. Start Ollama locally "
            "(default: `ollama serve` with model `llama3.2`) or configure "
            "`OPENAI_API_KEY` with active billing."
        )
    primary_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    fallback_model = os.getenv("OPENAI_FALLBACK_MODEL", "gpt-3.5-turbo")

    # Try the configured model first; if it's not available for your key,
    # fall back to a safer default.
    try:
        response = client.chat.completions.create(
            model=primary_model,
            messages=messages,
        )
        return response.choices[0].message.content
    except Exception as e1:
        # If your key doesn't have access to the configured model, this helps recovery.
        try:
            response = client.chat.completions.create(
                model=fallback_model,
                messages=messages,
            )
            return response.choices[0].message.content
        except Exception as e2:
            err = f"{e2}"
            if "insufficient_quota" in err:
                return (
                    "OpenAI quota exceeded (429). Please check your OpenAI billing/plan and "
                    "add credits, or run Ollama locally for free responses."
                )
            if "rate_limit" in err or "429" in err:
                return (
                    "OpenAI rate limit reached (429). Please wait a bit and try again."
                )
            return (
                "OpenAI request failed. Check model access/quota, or switch to local Ollama."
            )