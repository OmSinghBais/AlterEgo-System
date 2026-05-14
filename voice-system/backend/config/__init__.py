"""
AlterEGO Voice System — Configuration Bridge
Uses settings.py for centralized management.
"""

import os
from pathlib import Path
from .settings import get_settings

settings = get_settings()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"
AUDIO_DIR = BASE_DIR / "audio"
AUDIO_INPUT_DIR = AUDIO_DIR / "input"
AUDIO_OUTPUT_DIR = AUDIO_DIR / "output"
AUDIO_TEMP_DIR = AUDIO_DIR / "temp"

for d in [DATA_DIR, LOGS_DIR, AUDIO_DIR, AUDIO_INPUT_DIR, AUDIO_OUTPUT_DIR, AUDIO_TEMP_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Persistence
SQLITE_DB = DATA_DIR / "alterego.db"
MAX_CONTEXT_MESSAGES = settings.MAX_CONTEXT_MESSAGES

# API Keys
OPENAI_API_KEY = settings.OPENAI_API_KEY
ELEVENLABS_API_KEY = settings.ELEVENLABS_API_KEY
DEEPGRAM_API_KEY = settings.DEEPGRAM_API_KEY
PICOVOICE_API_KEY = settings.PICOVOICE_API_KEY

# LLM / STT / TTS Models
# If API key is missing, we likely want Ollama (unless it's deliberate)
USE_OLLAMA = not bool(settings.OPENAI_API_KEY)
OLLAMA_BASE_URL = settings.OPENAI_BASE_URL or "http://localhost:11434/v1"
OLLAMA_MODEL = "llama3" # Default local model

OPENAI_MODEL = settings.OPENAI_MODEL
ELEVENLABS_VOICE_ID = settings.ELEVENLABS_VOICE_ID
ELEVENLABS_MODEL_ID = settings.ELEVENLABS_MODEL_ID
WHISPER_MODEL = settings.WHISPER_MODEL
WHISPER_DEVICE = settings.WHISPER_DEVICE
WHISPER_COMPUTE = settings.WHISPER_COMPUTE
SAMPLE_RATE = 16000

# Wake Word
ENABLE_WAKEWORD = settings.ENABLE_WAKEWORD
WAKEWORD_THRESHOLD = settings.WAKEWORD_THRESHOLD
WAKEWORD_COOLDOWN = settings.WAKEWORD_COOLDOWN
WAKEWORD_MODELS = settings.WAKEWORD_MODELS

# Server
HOST = settings.WS_HOST
PORT = settings.WS_PORT
FRONTEND_URL = settings.FRONTEND_URL
