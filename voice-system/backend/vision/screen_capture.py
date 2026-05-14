import pyautogui
import time
from pathlib import Path
from core.logger import logger

VISION_DIR = Path(__file__).resolve().parent.parent / "data" / "vision"
VISION_DIR.mkdir(parents=True, exist_ok=True)

def capture_screen(filename: str = None) -> Path:
    """Capture the full desktop screen."""
    if not filename:
        filename = f"screen_{int(time.time())}.png"
    
    path = VISION_DIR / filename
    try:
        screenshot = pyautogui.screenshot()
        screenshot.save(str(path))
        logger.info(f"📸 Screen captured: {path}")
        return path
    except Exception as e:
        logger.error(f"Screen capture failed: {e}")
        return None

def capture_region(x: int, y: int, width: int, height: int, filename: str = None) -> Path:
    """Capture a specific region of the screen."""
    if not filename:
        filename = f"region_{int(time.time())}.png"
    
    path = VISION_DIR / filename
    try:
        screenshot = pyautogui.screenshot(region=(x, y, width, height))
        screenshot.save(str(path))
        logger.info(f"📸 Region captured: {path}")
        return path
    except Exception as e:
        logger.error(f"Region capture failed: {e}")
        return None
