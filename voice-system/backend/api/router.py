from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import time
import asyncio

from config.settings import get_settings
from utils.logger import log_api_event
from llm import stream_response
from personality import DEFAULT_MODE, MODES
from memory import append_message, score_importance, get_all_facts, get_db
from db.models import LongTermMemory
from stt.engine import transcribe

router = APIRouter()
settings = get_settings()

class ChatRequest(BaseModel):
    message: str
    mode: str = DEFAULT_MODE

@router.get("/")
async def root():
    log_api_event("GET", "/")
    return {"status": "AlterEGO Backend Running", "module": 4}

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    log_api_event("POST", "/chat")
    try:
        full_response = ""
        async for chunk in stream_response(req.message, req.mode):
            full_response += chunk
        
        importance = score_importance(req.message)
        await append_message("user", req.message, importance=importance)
        await append_message("assistant", full_response)
        
        return {"response": full_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat-stream")
async def chat_stream_endpoint(req: ChatRequest):
    log_api_event("POST", "/chat-stream")
    async def generate():
        async for chunk in stream_response(req.message, req.mode):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")

@router.post("/voice")
async def voice_endpoint(audio: UploadFile = File(...), mode: str = DEFAULT_MODE):
    log_api_event("POST", "/voice")
    content = await audio.read()
    
    try:
        loop = asyncio.get_event_loop()
        user_text = await loop.run_in_executor(None, transcribe, content)
        
        if not user_text or not user_text.strip():
            return {"error": "No speech detected", "transcript": ""}
            
        full_response = ""
        async for chunk in stream_response(user_text, mode):
            full_response += chunk
            
        importance = score_importance(user_text)
        await append_message("user", user_text, importance=importance)
        await append_message("assistant", full_response)
        
        return {
            "transcript": user_text,
            "response": full_response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes")
async def list_modes():
    return {"modes": list(MODES.keys()), "default": DEFAULT_MODE}

@router.get("/memory")
async def get_long_term_memory():
    db = get_db()
    try:
        mems = db.query(LongTermMemory).order_by(LongTermMemory.created_at.desc()).all()
        return [{
            "id": m.id,
            "content": m.content,
            "category": m.category,
            "importance": m.importance,
            "created_at": m.created_at
        } for m in mems]
    finally:
        db.close()

@router.get("/facts")
async def get_facts():
    return get_all_facts()
