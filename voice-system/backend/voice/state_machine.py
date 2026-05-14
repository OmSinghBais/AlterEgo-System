from enum import Enum
from typing import Optional, Callable, List
from core.logger import logger
from api.state import subsystem_status

class VoiceState(Enum):
    IDLE = "idle"
    LISTENING = "listening"
    THINKING = "thinking"
    SPEAKING = "speaking"
    INTERRUPTED = "interrupted"
    EXECUTING = "executing"
    WAITING = "waiting"

class VoiceStateMachine:
    def __init__(self):
        self._state = VoiceState.IDLE
        self._on_change_callbacks: List[Callable[[VoiceState], None]] = []

    @property
    def state(self) -> VoiceState:
        return self._state

    def transition_to(self, new_state: VoiceState):
        if self._state == new_state:
            return
        
        logger.info(f"🎙️ Voice State: {self._state.value.upper()} ➔ {new_state.value.upper()}")
        self._state = new_state
        
        # Sync with global subsystem status
        subsystem_status["voice_state"] = new_state.value
        
        for callback in self._on_change_callbacks:
            try:
                callback(new_state)
            except Exception as e:
                logger.error(f"Error in voice state callback: {e}")

    def on_change(self, callback: Callable[[VoiceState], None]):
        self._on_change_callbacks.append(callback)

# Global instance
voice_machine = VoiceStateMachine()
