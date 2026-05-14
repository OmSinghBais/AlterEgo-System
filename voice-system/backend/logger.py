"""
AlterEGO — Structured logging with Loguru.

Task 14: Tracks latency, wake triggers, interruptions, failures, token usage.
"""

import sys
from pathlib import Path

try:
    from loguru import logger
except ImportError:
    # Fallback to stdlib logging if loguru not installed
    import logging

    logger = logging.getLogger("alterego")  # type: ignore[assignment]
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Configure loguru
if hasattr(logger, "configure"):
    logger.configure(
        handlers=[
            {
                "sink": sys.stderr,
                "level": "INFO",
                "format": (
                    "<green>{time:HH:mm:ss}</green> | "
                    "<level>{level: <8}</level> | "
                    "<cyan>{name}</cyan>:<cyan>{function}</cyan> | "
                    "<level>{message}</level>"
                ),
                "colorize": True,
            },
            {
                "sink": str(LOG_DIR / "alterego.log"),
                "level": "DEBUG",
                "rotation": "10 MB",
                "retention": "7 days",
                "format": "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
            },
        ]
    )


def log_latency(stage: str, duration_ms: float) -> None:
    """Log pipeline stage latency."""
    logger.info(f"⏱  {stage}: {duration_ms:.0f}ms")


def log_event(event: str, **kwargs) -> None:
    """Log a named event with optional metadata."""
    extra = " ".join(f"{k}={v}" for k, v in kwargs.items())
    logger.info(f"📌 {event} {extra}".strip())
