from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os
from typing import Optional

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: Optional[str] = None
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"
    ELEVENLABS_MODEL_ID: str = "eleven_monolingual_v1"
    TAVILY_API_KEY: str = ""
    
    # Infrastructure
    REDIS_URL: str = "redis://localhost:6379"
    DATABASE_URL: str = "sqlite:///./alterego.db"
    
    # WebSocket & Server
    WS_HOST: str = "0.0.0.0"
    WS_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3001"
    
    # AI Models
    OPENAI_MODEL: str = "gpt-4o-mini"
    WHISPER_MODEL: str = "base.en"
    WHISPER_DEVICE: str = "cpu" # or "cuda" / "mps"
    WHISPER_COMPUTE: str = "int8"
    
    # Wake Word
    ENABLE_WAKEWORD: bool = True
    WAKEWORD_MODELS: list[str] = ["hey_jarvis_v0.1"]
    WAKEWORD_THRESHOLD: float = 0.5
    WAKEWORD_COOLDOWN: float = 2.0
    
    # Agent & Memory Settings
    MAX_CONTEXT_MESSAGES: int = 20
    MAX_MEMORY_RESULTS: int = 5
    AGENT_THOUGHT_LOGGING: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
