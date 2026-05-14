import sys
from pathlib import Path
from loguru import logger

# Base directory for logs
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Remove default handler
logger.remove()

# 1. Console Handler (Colored)
logger.add(
    sys.stderr,
    level="INFO",
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> | <level>{message}</level>",
    colorize=True,
)

# 2. Main Production Log
logger.add(
    LOG_DIR / "production.log",
    level="DEBUG",
    rotation="100 MB",
    retention="30 days",
    compression="zip",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
)

# 3. Error Tracing
logger.add(
    LOG_DIR / "errors.log",
    level="ERROR",
    backtrace=True,
    diagnose=True,
)

# Helpers for standardized logging
def log_latency(stage: str, duration_ms: float):
    logger.bind(type="performance").info(f"⏱  {stage}: {duration_ms:.0f}ms")

def log_token_usage(model: str, total: int):
    logger.bind(type="billing").info(f"🪙 [Tokens] {model}: {total}")

def log_agent_thought(agent: str, thought: str):
    logger.bind(type="agent").info(f"💭 [{agent}] {thought}")
