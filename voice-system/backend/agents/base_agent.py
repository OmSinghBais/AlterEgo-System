from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from core.logger import logger
from jobs.worker import publish_telemetry

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.memory: List[Dict[str, Any]] = []

    @abstractmethod
    async def think(self, goal: str) -> str:
        """Analyze the goal and formulate a thought."""
        pass

    @abstractmethod
    async def plan(self, thought: str) -> List[str]:
        """Break the goal into actionable steps."""
        pass

    @abstractmethod
    async def act(self, step: str) -> Any:
        """Execute a single step using tools."""
        pass

    @abstractmethod
    async def reflect(self, result: Any) -> str:
        """Evaluate the outcome and store lessons."""
        pass

    def log_thought(self, thought: str):
        logger.bind(type="agent").info(f"💭 [{self.name}] {thought}")
        publish_telemetry({
            "type": "agent_thought",
            "agent": self.name,
            "content": thought
        })
