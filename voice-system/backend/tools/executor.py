"""
AlterEGO — Tool Executor

Validates, permission-checks, and executes tool calls safely.
"""

import json
import time
from typing import Any
from tools.registry import registry, ToolDefinition, PERMISSION_AUTO, PERMISSION_CONFIRM, PERMISSION_BLOCKED
from events.event_bus import bus, TOOL_CALLED, TOOL_FINISHED, ERROR_OCCURRED
from utils.logger import logger, log_latency


class ToolExecutionError(Exception):
    pass


class ToolPermissionDenied(Exception):
    pass


async def execute_tool(
    tool_name: str,
    arguments: dict[str, Any] | None = None,
    user_approved: bool = False,
    retries: int = 2
) -> dict[str, Any]:
    """
    Execute a registered tool with safety validation and retry logic.
    """
    from safety.permission_manager import safety_layer
    
    t0 = time.perf_counter()
    args = arguments or {}

    # 1. Safety Validation
    is_safe, permission = safety_layer.validate_tool_call(tool_name, args)
    if not is_safe:
        return {"success": False, "result": None, "error": permission}
    
    if permission == "manual" and not user_approved:
        return {
            "success": False,
            "result": None,
            "error": f"Approval required for {tool_name}",
            "needs_approval": True
        }

    # Find the tool
    tool = registry.get(tool_name)
    if not tool:
        return {"success": False, "result": None, "error": f"Unknown tool: {tool_name}"}

    await bus.emit(TOOL_CALLED, {"tool": tool_name, "args": args})

    # 2. Execution Loop with Retries
    last_error = None
    for attempt in range(retries + 1):
        try:
            if tool.handler is None:
                return {"success": False, "result": None, "error": "No handler"}

            result = await tool.handler(**args)
            
            elapsed = (time.perf_counter() - t0) * 1000
            log_latency(f"tool_{tool_name}", elapsed)
            await bus.emit(TOOL_FINISHED, {"tool": tool_name, "success": True})
            
            return {"success": True, "result": result, "error": None}

        except Exception as e:
            last_error = str(e)
            logger.warning(f"Attempt {attempt+1} failed for {tool_name}: {e}")
            if attempt < retries:
                await asyncio.sleep(1) # Backoff
            
    # If all attempts fail
    await bus.emit(ERROR_OCCURRED, {"source": "tool_executor", "tool": tool_name, "error": last_error})
    return {"success": False, "result": None, "error": last_error}
