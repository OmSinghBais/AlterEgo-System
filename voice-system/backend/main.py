import asyncio
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from config.settings import get_settings
from utils.logger import logger, log_api_event
from api.router import router as api_router
from api.websocket import voice_ws_handler
from api.state import subsystem_status, connected_clients
from stt.engine import get_model as get_whisper
import redis.asyncio as redis
import orjson

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AlterEGO Backend Starting...")
    
    # Pre-load models
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, get_whisper)
    subsystem_status["stt"] = "online"

    # Start telemetry bridge
    asyncio.create_task(telemetry_bridge())

    # Start wake word thread
    from main_utils import start_wakeword_thread
    start_wakeword_thread()

    logger.info("✅ All systems online.")
    yield
    logger.info("🛑 Shutting down.")

app = FastAPI(
    title="AlterEGO AI Assistant",
    version="4.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api")

@app.websocket("/ws/voice")
async def voice_ws(ws: WebSocket):
    await voice_ws_handler(ws)

async def telemetry_bridge():
    """Listen for agent telemetry and broadcast to all connected WebSocket clients."""
    r = redis.from_url(settings.REDIS_URL)
    pubsub = r.pubsub()
    await pubsub.subscribe("agent_telemetry")
    
    logger.info("🛰️ Telemetry bridge active.")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                # Broadcast to all connected clients
                for ws in list(connected_clients):
                    try:
                        await ws.send_bytes(data)
                    except Exception:
                        connected_clients.discard(ws)
    except Exception as e:
        logger.error(f"Telemetry bridge error: {e}")
    finally:
        await pubsub.unsubscribe("agent_telemetry")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.WS_HOST, 
        port=settings.PORT or settings.WS_PORT, 
        reload=False, # Disable reload in production
        workers=1 # Using 1 worker for websocket stability in dev
    )
