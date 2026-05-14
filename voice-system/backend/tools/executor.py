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
) -> dict[str, Any]:
    """
    Execute a registered tool with permission checking.

    Returns: {"success": bool, "result": Any, "error": str | None}
    """
    t0 = time.perf_counter()
    args = arguments or {}

    # Find the tool
    tool = registry.get(tool_name)
    if not tool:
        return {"success": False, "result": None, "error": f"Unknown tool: {tool_name}"}

    # Permission check
    if tool.permission == PERMISSION_BLOCKED:
        return {
            "success": False,
            "result": None,
            "error": f"Tool '{tool_name}' is blocked for safety.",
        }

    if tool.permission == PERMISSION_CONFIRM and not user_approved:
        return {
            "success": False,
            "result": None,
            "error": f"Tool '{tool_name}' requires user approval.",
            "needs_approval": True,
        }

    # Emit event
    await bus.emit(TOOL_CALLED, {"tool": tool_name, "args": args})

    # Execute
    try:
        if tool.handler is None:
            return {"success": False, "result": None, "error": "Tool has no handler"}

        result = await tool.handler(**args)

        elapsed = (time.perf_counter() - t0) * 1000
        log_latency(f"tool_{tool_name}", elapsed)

        await bus.emit(TOOL_FINISHED, {
            "tool": tool_name,
            "success": True,
            "duration_ms": elapsed,
        })

        return {"success": True, "result": result, "error": None}

    except Exception as e:
        logger.error(f"Tool execution failed [{tool_name}]: {e}")
        await bus.emit(ERROR_OCCURRED, {
            "source": "tool_executor",
            "tool": tool_name,
            "error": str(e),
        })
        return {"success": False, "result": None, "error": str(e)}
