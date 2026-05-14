"""
AlterEGO — Audio Priority Queue

Priority-based audio playback queue with interruption support.
Prevents overlap, supports fade in/out.
"""

import asyncio
from dataclasses import dataclass, field
from enum import IntEnum
from typing import Any
from logger import logger


class AudioPriority(IntEnum):
    AMBIENT = 10
    NOTIFICATION = 40
    AI_SPEECH = 80
    WAKE_CONFIRM = 90
    INTERRUPTION = 100


@dataclass(order=True)
class AudioItem:
    priority: int
    audio_data: bytes = field(compare=False)
    label: str = field(compare=False, default="")
    fade_in_ms: int = field(compare=False, default=0)
    fade_out_ms: int = field(compare=False, default=0)


class AudioQueue:
    """
    Server-side audio queue.

    Manages audio items by priority. Higher priority items
    can interrupt lower priority ones. Sends audio chunks
    to the WebSocket client for playback.
    """

    def __init__(self) -> None:
        self._queue: asyncio.PriorityQueue[AudioItem] = asyncio.PriorityQueue()
        self._current_priority: int = 0
        self._interrupted = False
        self._playing = False

    async def enqueue(
        self,
        audio_data: bytes,
        priority: AudioPriority = AudioPriority.AI_SPEECH,
        label: str = "",
        fade_in_ms: int = 0,
        fade_out_ms: int = 0,
    ) -> None:
        """Add audio to the queue."""
        item = AudioItem(
            priority=-priority,  # Negative for max-priority-first
            audio_data=audio_data,
            label=label,
            fade_in_ms=fade_in_ms,
            fade_out_ms=fade_out_ms,
        )
        await self._queue.put(item)
        logger.debug(f"🔊 Queued: {label} (priority={priority})")

    async def interrupt(self) -> None:
        """Clear queue and signal interruption."""
        self._interrupted = True
        # Drain the queue
        while not self._queue.empty():
            try:
                self._queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        logger.debug("🔇 Audio queue interrupted and cleared")

    async def get_next(self) -> AudioItem | None:
        """Get next audio item from queue. Returns None if interrupted or empty."""
        if self._interrupted:
            self._interrupted = False
            return None
        try:
            item = self._queue.get_nowait()
            self._current_priority = -item.priority
            return item
        except asyncio.QueueEmpty:
            return None

    async def drain_to_ws(self, ws: Any) -> None:
        """Send all queued audio to WebSocket client in priority order."""
        from error_handler import safe_send

        while not self._queue.empty() and not self._interrupted:
            item = await self.get_next()
            if item and item.audio_data:
                await safe_send(ws, item.audio_data)

        self._current_priority = 0

    @property
    def is_empty(self) -> bool:
        return self._queue.empty()

    @property
    def current_priority(self) -> int:
        return self._current_priority

    def reset(self) -> None:
        """Reset state."""
        self._interrupted = False
        self._current_priority = 0
