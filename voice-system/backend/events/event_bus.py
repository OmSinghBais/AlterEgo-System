"""
AlterEGO — Central Event Bus

asyncio-based pub/sub for decoupled pipeline orchestration.
All pipeline stages emit events; subscribers react independently.
"""

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Coroutine
from logger import logger

# Event type constants
WAKEWORD_DETECTED = "wakeword_detected"
CONVERSATION_STARTED = "conversation_started"
CONVERSATION_ENDED = "conversation_ended"
STT_STARTED = "stt_started"
STT_PARTIAL = "stt_partial"
STT_FINISHED = "stt_finished"
LLM_STARTED = "llm_started"
LLM_FIRST_TOKEN = "llm_first_token"
LLM_FINISHED = "llm_finished"
TTS_STARTED = "tts_started"
TTS_CHUNK = "tts_chunk"
TTS_FINISHED = "tts_finished"
INTERRUPT_RECEIVED = "interrupt_received"
MEMORY_RETRIEVED = "memory_retrieved"
TOOL_CALLED = "tool_called"
TOOL_FINISHED = "tool_finished"
ERROR_OCCURRED = "error_occurred"

# Type alias for event handlers
EventHandler = Callable[["Event"], Coroutine[Any, Any, None]]


@dataclass
class Event:
    """Immutable event with type, data, and timestamp."""
    type: str
    data: dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)

    def __repr__(self) -> str:
        return f"Event({self.type}, {self.data})"


class EventBus:
    """
    Async pub/sub event bus.

    Usage:
        bus = EventBus()
        bus.on("stt_finished", my_handler)
        await bus.emit("stt_finished", {"text": "hello"})
    """

    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = {}
        self._global_handlers: list[EventHandler] = []
        self._history: list[Event] = []
        self._max_history = 200

    def on(self, event_type: str, handler: EventHandler) -> None:
        """Subscribe to a specific event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    def on_all(self, handler: EventHandler) -> None:
        """Subscribe to ALL events (useful for logging/metrics)."""
        self._global_handlers.append(handler)

    def off(self, event_type: str, handler: EventHandler) -> None:
        """Unsubscribe from an event type."""
        if event_type in self._handlers:
            self._handlers[event_type] = [
                h for h in self._handlers[event_type] if h != handler
            ]

    async def emit(self, event_type: str, data: dict[str, Any] | None = None) -> None:
        """Emit an event to all subscribers."""
        event = Event(type=event_type, data=data or {})

        # Store in history
        self._history.append(event)
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]

        # Dispatch to type-specific handlers
        handlers = self._handlers.get(event_type, [])
        for handler in handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Event handler error [{event_type}]: {e}")

        # Dispatch to global handlers
        for handler in self._global_handlers:
            try:
                await handler(event)
            except Exception as e:
                logger.error(f"Global handler error [{event_type}]: {e}")

    def get_history(self, event_type: str | None = None, limit: int = 50) -> list[Event]:
        """Get recent events, optionally filtered by type."""
        if event_type:
            filtered = [e for e in self._history if e.type == event_type]
            return filtered[-limit:]
        return self._history[-limit:]

    @property
    def stats(self) -> dict[str, int]:
        """Count events by type in history."""
        counts: dict[str, int] = {}
        for e in self._history:
            counts[e.type] = counts.get(e.type, 0) + 1
        return counts


# ── Singleton ────────────────────────────────────────────────────────

bus = EventBus()


# ── Default logging subscriber ───────────────────────────────────────

async def _log_event(event: Event) -> None:
    """Default subscriber that logs all events."""
    skip = {TTS_CHUNK, STT_PARTIAL}  # Too noisy
    if event.type not in skip:
        extra = " ".join(f"{k}={v}" for k, v in event.data.items() if k != "audio")
        logger.debug(f"📌 {event.type} {extra}".strip())


bus.on_all(_log_event)
