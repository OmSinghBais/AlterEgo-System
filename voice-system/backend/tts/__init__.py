# voice-system/backend/tts/__init__.py
from tts.engine import synthesize, synthesize_streaming

__all__ = ["synthesize", "synthesize_streaming"]
