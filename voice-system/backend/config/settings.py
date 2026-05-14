from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEEPGRAM_API_KEY: str = "c7c499a46c45141869e8bf728984921c4e436f9a"
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    
    # Infrastructure
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./alterego.db")
    ENABLE_WAKEWORD: bool = os.getenv("ENABLE_WAKEWORD", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # WebSocket
    WS_HOST: str = "0.0.0.0"
    WS_PORT: int = 8000
    PORT: Optional[int] = None # Added for cloud environments like Railway
    
    # Personality
    DEFAULT_PERSONALITY: str = "jarvis"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
