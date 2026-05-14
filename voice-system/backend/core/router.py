from typing import Optional
from core.settings import get_settings

settings = get_settings()

class ModelRouter:
    @staticmethod
    def get_model_for_task(task_type: str) -> str:
        """
        Dynamically route tasks to specific models.
        """
        if task_type == "vision":
            return "gpt-4o" # Vision specialist
        elif task_type == "planning":
            return "gpt-4o" # Complex reasoning
        elif task_type == "summary":
            return "gpt-4o-mini" # Fast/cheap
        elif task_type == "local_fallback":
            return "ollama/llama3" # Local fallback
        
        return settings.OPENAI_MODEL

# Global router instance
model_router = ModelRouter()
