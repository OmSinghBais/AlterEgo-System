# voice-system/backend/events/__init__.py
from events.event_bus import EventBus, bus

__all__ = ["EventBus", "bus"]
