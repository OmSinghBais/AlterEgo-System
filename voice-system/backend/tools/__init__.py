# voice-system/backend/tools/__init__.py
from tools.registry import registry
from tools.executor import execute_tool

# Import modules with tools to trigger registration
import memory.temporal
import vision.reasoning
import vision.ocr
import vision.ui_detector
import tools.system
import tools.browser

__all__ = ["registry", "execute_tool"]
