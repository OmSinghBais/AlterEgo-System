"""
AlterEGO — Tool Registry

Decorator-based tool registration for AI function calling.
"""

from dataclasses import dataclass, field
from typing import Any, Callable, Coroutine
from utils.logger import logger

# Permission levels
PERMISSION_AUTO = "auto"          # Execute without asking
PERMISSION_CONFIRM = "confirm"    # Ask user first
PERMISSION_BLOCKED = "blocked"    # Never execute


@dataclass
class ToolDefinition:
    """Metadata for a registered tool."""
    name: str
    description: str
    parameters: dict[str, Any]
    permission: str = PERMISSION_AUTO
    handler: Callable[..., Coroutine[Any, Any, Any]] | None = None
    tags: list[str] = field(default_factory=list)

    def to_openai_schema(self) -> dict:
        """Convert to OpenAI function calling format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


class ToolRegistry:
    """Central registry for all available tools."""

    def __init__(self) -> None:
        self._tools: dict[str, ToolDefinition] = {}

    def register(
        self,
        name: str,
        description: str,
        parameters: dict[str, Any] | None = None,
        permission: str = PERMISSION_AUTO,
        tags: list[str] | None = None,
    ) -> Callable:
        """Decorator to register a tool function."""
        def decorator(func: Callable) -> Callable:
            tool = ToolDefinition(
                name=name,
                description=description,
                parameters=parameters or {"type": "object", "properties": {}},
                permission=permission,
                handler=func,
                tags=tags or [],
            )
            self._tools[name] = tool
            logger.debug(f"🔧 Registered tool: {name}")
            return func
        return decorator

    def get(self, name: str) -> ToolDefinition | None:
        return self._tools.get(name)

    def list_tools(self) -> list[ToolDefinition]:
        return list(self._tools.values())

    def list_names(self) -> list[str]:
        return list(self._tools.keys())

    def to_openai_tools(self) -> list[dict]:
        """Get all tools in OpenAI function calling format."""
        return [t.to_openai_schema() for t in self._tools.values()]

    def get_safe_tools(self) -> list[ToolDefinition]:
        """Get only auto-approved tools."""
        return [t for t in self._tools.values() if t.permission == PERMISSION_AUTO]


# Singleton registry
registry = ToolRegistry()
