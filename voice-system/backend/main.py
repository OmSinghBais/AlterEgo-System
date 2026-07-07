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

if settings.SENTRY_DSN:
    try:
        import sentry_sdk
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            traces_sample_rate=1.0,
            environment=settings.ENVIRONMENT,
        )
        logger.info("📡 Sentry initialized for backend.")
    except ImportError:
        logger.warning("⚠️ sentry-sdk not installed — skipping error tracking.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AlterEGO Backend Starting...")
    
    # Pre-load models
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, get_whisper)
    subsystem_status["stt"] = "online"

    # 🧠 Warm up Intelligence
    from utils.embeddings import get_embedding_model
    get_embedding_model() # Pre-load heavy weights
    
    # Start telemetry bridge
    asyncio.create_task(telemetry_bridge())

    # Start wake word thread (only if enabled)
    if settings.ENABLE_WAKEWORD:
        from main_utils import start_wakeword_thread
        start_wakeword_thread()
    else:
        logger.info("🎙️ Wake-word listener disabled (Cloud Mode).")

    if settings.ENVIRONMENT == "development":
        threading.Thread(target=open_browser, daemon=True).start()

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
    allow_origins=[
        "https://alter-ego-system-7pnm.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def open_browser():
    """Open the frontend in the default browser."""
    import webbrowser
    import time
    time.sleep(2) # Wait for server to be fully ready
    url = f"{settings.FRONTEND_URL}/dashboard"
    logger.info(f"🌐 Opening dashboard: {url}")
    webbrowser.open(url)

# Routes
@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "AlterEGO AI",
        "environment": settings.ENVIRONMENT,
        "version": app.version
    }

app.include_router(api_router, prefix="/api")

@app.websocket("/ws/voice")
async def voice_ws(ws: WebSocket):
    await voice_ws_handler(ws)

async def telemetry_bridge():
    """Listen for agent telemetry and broadcast to all connected WebSocket clients."""
    try:
        r = redis.from_url(settings.REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe("agent_telemetry")
        logger.info("🛰️ Telemetry bridge active.")
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                for ws in list(connected_clients):
                    try:
                        await ws.send_bytes(data)
                    except Exception:
                        connected_clients.discard(ws)
    except Exception as e:
        logger.warning(f"Telemetry bridge (Redis) unavailable: {e}")
    finally:
        try:
            await pubsub.unsubscribe("agent_telemetry")
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.WS_HOST, 
        port=settings.PORT or settings.WS_PORT, 
        reload=False, # Disable reload in production
        workers=1 # Using 1 worker for websocket stability in dev
    )
