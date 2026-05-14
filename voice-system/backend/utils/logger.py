import sys
from pathlib import Path
from loguru import logger

# Base directory for logs
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Remove default handler
logger.remove()

# 1. Console Handler
logger.add(
    sys.stderr,
    level="INFO",
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> | <level>{message}</level>",
    colorize=True,
)

# 2. Main/General Log
logger.add(
    LOG_DIR / "alterego.log",
    level="DEBUG",
    rotation="10 MB",
    retention="7 days",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
)

# 3. API & WebSocket Log
logger.add(
    LOG_DIR / "api.log",
    filter=lambda record: "api" in record["extra"] or "websocket" in record["extra"],
    level="INFO",
    rotation="10 MB",
)

# 4. Error Log
logger.add(
    LOG_DIR / "errors.log",
    level="ERROR",
    rotation="10 MB",
)

# 5. Performance/Latency Log
logger.add(
    LOG_DIR / "performance.log",
    filter=lambda record: "performance" in record["extra"],
    level="INFO",
    rotation="10 MB",
)

def log_latency(stage: str, duration_ms: float):
    """Log performance metrics."""
    logger.bind(performance=True).info(f"⏱  {stage}: {duration_ms:.0f}ms")

def log_api_event(method: str, path: str, status: int = 200):
    """Log HTTP API events."""
    logger.bind(api=True).info(f"🌐 {method} {path} - {status}")

def log_ws_event(event: str, session_id: str = "unknown"):
    """Log WebSocket events."""
    logger.bind(websocket=True).info(f"🔌 [Session:{session_id}] {event}")

def log_token_usage(model: str, prompt_tokens: int, completion_tokens: int):
    """Log LLM token consumption."""
    total = prompt_tokens + completion_tokens
    logger.bind(performance=True).info(f"🪙 [Tokens] Model: {model} | Total: {total} (P:{prompt_tokens}, C:{completion_tokens})")

def log_memory_event(event: str, content_snippet: str = ""):
    """Log semantic memory events."""
    logger.info(f"🧠 [Memory] {event}: {content_snippet}")
