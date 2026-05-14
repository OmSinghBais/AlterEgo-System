from fastapi import WebSocket

connected_clients: set[WebSocket] = set()
conversation_active: bool = False
subsystem_status: dict[str, str] = {
    "stt": "offline",
    "tts": "online",
    "llm": "online",
    "memory": "online",
    "websocket": "online",
    "wakeword": "offline",
}

def set_conversation_active(active: bool):
    global conversation_active
    conversation_active = active
