# FastAPI Entry Point
from fastapi import FastAPI
from app.api.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware

application = FastAPI(title="AI Smart Assistant")

application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

application.include_router(chat_router, prefix="/api/v1")

# Alias for uvicorn
app = application