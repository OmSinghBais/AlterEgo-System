# voice-system/backend/stt/__init__.py
from stt.engine import transcribe, get_model

__all__ = ["transcribe", "get_model"]
