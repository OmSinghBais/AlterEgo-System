# voice-system/backend/tools/__init__.py
from tools.registry import registry
from tools.executor import execute_tool

__all__ = ["registry", "execute_tool"]
