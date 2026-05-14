"""
AlterEGO — Error Recovery System

Task 13: Centralized error handling with recovery strategies.
"""

from utils.logger import logger


class RecoverableError(Exception):
    """Error that the system can recover from."""
    pass


async def handle_stt_error(error: Exception) -> str:
    """Handle STT failure — return empty string and log."""
    logger.error(f"STT failed: {error}")
    return ""


async def handle_llm_error(error: Exception) -> str:
    """Handle LLM failure — return fallback response."""
    logger.error(f"LLM failed: {error}")
    return "I couldn't process that right now. Please try again."


async def handle_tts_error(error: Exception) -> bytes:
    """Handle TTS failure — return empty audio and log."""
    logger.error(f"TTS failed: {error}")
    return b""


def handle_ws_error(error: Exception) -> dict:
    """Handle WebSocket-level error — return error event."""
    msg = str(error).lower()
    if "disconnect" in msg:
        return {"type": "disconnected", "recoverable": True}
    logger.error(f"WebSocket error: {error}")
    return {"type": "error", "message": str(error), "recoverable": False}


async def safe_send(ws, data) -> bool:
    """Send data to WebSocket, catching errors. Returns True if sent."""
    try:
        if isinstance(data, bytes):
            await ws.send_bytes(data)
        elif isinstance(data, dict):
            await ws.send_json(data)
        else:
            await ws.send_text(str(data))
        return True
    except Exception:
        return False
