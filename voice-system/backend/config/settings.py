from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional, List
from pathlib import Path
import os

# ── Load .env BEFORE anything else ───────────────────────────────────
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
if _ENV_FILE.exists():
    from dotenv import load_dotenv
    load_dotenv(_ENV_FILE, override=True)

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEEPGRAM_API_KEY: str = ""
    PICOVOICE_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    ELEVENLABS_MODEL_ID: str = "eleven_flash_v2_5"
    TAVILY_API_KEY: str = ""
    
    # Infrastructure
    REDIS_URL: str = "redis://localhost:6379"
    DATABASE_URL: str = "sqlite:///./alterego.db"
    SENTRY_DSN: str = ""
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # WebSocket & Server
    WS_HOST: str = "0.0.0.0"
    WS_PORT: int = 8000
    PORT: Optional[int] = None
    FRONTEND_URL: str = "http://localhost:3001"
    
    # AI Models
    OPENAI_MODEL: str = "gpt-4o"
    STT_ENGINE: str = "deepgram" # choices: "deepgram", "whisper"
    WHISPER_MODEL: str = "base.en"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE: str = "int8"
    
    # Wake Word
    ENABLE_WAKEWORD: bool = True
    WAKEWORD_MODELS: List[str] = ["hey_jarvis_v0.1"]
    WAKEWORD_THRESHOLD: float = 0.5
    WAKEWORD_COOLDOWN: float = 2.0
    
    # Agent & Memory Settings
    MAX_CONTEXT_MESSAGES: int = 20
    MAX_MEMORY_RESULTS: int = 5
    AGENT_THOUGHT_LOGGING: bool = True
    DEFAULT_PERSONALITY: str = "jarvis"
    
    # Compute
    USE_MODAL_VISION: bool = False
    
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings():
    return Settings()
