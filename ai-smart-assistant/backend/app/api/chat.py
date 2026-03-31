from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.chat_service import get_ai_response

router = APIRouter(prefix="/api", tags=["chat"])

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: List[ChatHistoryItem] = []
    metadata: dict = {}

@router.post("/chat")
async def chat(req: ChatRequest):
    result = get_ai_response(
        req.message,
        session_id=req.session_id,
        history=[{"role": h.role, "content": h.content} for h in req.history],
    )
    return {"response": result}