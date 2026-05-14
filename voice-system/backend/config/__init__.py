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
MAX_CONTEXT_MESSAGES = 20

# API Keys
OPENAI_API_KEY = settings.OPENAI_API_KEY
ELEVENLABS_API_KEY = settings.ELEVENLABS_API_KEY
DEEPGRAM_API_KEY = settings.DEEPGRAM_API_KEY

# LLM / STT / TTS Models
USE_OLLAMA = True
OLLAMA_BASE_URL = "http://localhost:11434/v1"
OLLAMA_MODEL = "llama3"
OPENAI_MODEL = "gpt-4o-mini"
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
ELEVENLABS_MODEL_ID = "eleven_monolingual_v1"
WHISPER_MODEL = "base.en"
WHISPER_DEVICE = "cpu"
WHISPER_COMPUTE = "int8"
SAMPLE_RATE = 16000

# Wake Word
ENABLE_WAKEWORD = True
WAKEWORD_THRESHOLD = 0.5
WAKEWORD_COOLDOWN = 10
WAKEWORD_MODELS = ["hey_jarvis_v0.1"]

# Server
HOST = settings.WS_HOST
PORT = settings.WS_PORT
FRONTEND_URL = "http://localhost:3000"
