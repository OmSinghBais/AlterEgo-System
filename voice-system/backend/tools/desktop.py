import pyautogui
from tools.registry import registry, PERMISSION_CONFIRM
from core.logger import logger

# Safety: Disable fail-safe? No, keep it on. 
# Moving mouse to corner will abort.

@registry.register(
    name="desktop_control",
    description="Control the mouse and keyboard on the host machine. REQUIRES CONFIRMATION.",
    parameters={
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["move_to", "click", "type_text", "press_key"]},
            "x": {"type": "integer", "description": "X coordinate"},
            "y": {"type": "integer", "description": "Y coordinate"},
            "text": {"type": "string", "description": "Text to type"},
            "key": {"type": "string", "description": "Key to press, e.g. 'enter', 'tab'"}
        },
        "required": ["action"]
    },
    permission=PERMISSION_CONFIRM, # ALWAYS confirm desktop control
    tags=["system", "automation"]
)
async def desktop_control(action: str, x: int = None, y: int = None, text: str = None, key: str = None) -> str:
    try:
        if action == "move_to":
            pyautogui.moveTo(x, y, duration=0.5)
            return f"Moved mouse to {x}, {y}"
        
        elif action == "click":
            if x is not None and y is not None:
                pyautogui.click(x, y)
                return f"Clicked at {x}, {y}"
            pyautogui.click()
            return "Clicked current position"
        
        elif action == "type_text":
            pyautogui.write(text, interval=0.1)
            return f"Typed: {text}"
        
        elif action == "press_key":
            pyautogui.press(key)
            return f"Pressed key: {key}"
            
    except Exception as e:
        logger.error(f"Desktop control failed: {e}")
        return f"Control failed: {e}"
