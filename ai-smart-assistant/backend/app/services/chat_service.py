from app.core.llm import ask_llm
from app.tools.web_search import search_web

def get_ai_response(message: str, session_id: str | None = None, history: list | None = None):
    """Get AI response for user message"""
    if "latest" in message or "today" in message:
        data = search_web(message)
        message = f"Answer using this data: {data}\n\nUser question: {message}"
    return ask_llm(message, history=history or [])