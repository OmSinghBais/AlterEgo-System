"""
AlterEGO — Window & UI Detection
Detects open windows, active apps, and screen layout using macOS APIs.
"""

import subprocess
import json
from tools.registry import registry, PERMISSION_AUTO
from utils.logger import logger


def _get_frontmost_app() -> dict:
    """Get the currently focused application."""
    script = 'tell application "System Events" to get {name, bundle identifier} of first application process whose frontmost is true'
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            parts = result.stdout.strip().split(", ")
            return {"name": parts[0], "bundle_id": parts[1] if len(parts) > 1 else ""}
    except Exception:
        pass
    return {"name": "Unknown", "bundle_id": ""}


def _get_open_windows() -> list:
    """List all open windows using AppleScript."""
    script = '''
    tell application "System Events"
        set windowList to {}
        repeat with proc in (every application process whose visible is true)
            set appName to name of proc
            repeat with win in (every window of proc)
                set winTitle to name of win
                set end of windowList to appName & " | " & winTitle
            end repeat
        end repeat
        return windowList
    end tell
    '''
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            raw = result.stdout.strip()
            return [w.strip() for w in raw.split(", ") if w.strip()]
    except Exception as e:
        logger.warning(f"Window detection failed: {e}")
    return []


@registry.register(
    name="detect_desktop_state",
    description="Detect the current desktop state — active app, open windows, and screen layout.",
    parameters={
        "type": "object",
        "properties": {
            "include_windows": {"type": "boolean", "description": "Whether to list all open windows.", "default": True}
        }
    },
    permission=PERMISSION_AUTO,
    tags=["vision", "system"]
)
async def detect_desktop_state(include_windows: bool = True) -> str:
    frontmost = _get_frontmost_app()
    
    result_lines = [
        f"[Active Application]",
        f"  Name: {frontmost['name']}",
        f"  Bundle: {frontmost['bundle_id']}",
    ]
    
    if include_windows:
        windows = _get_open_windows()
        result_lines.append(f"\n[Open Windows] ({len(windows)} total)")
        for w in windows[:15]:  # Limit to prevent context overflow
            result_lines.append(f"  - {w}")
    
    return "\n".join(result_lines)


@registry.register(
    name="focus_app",
    description="Bring a specific application to the foreground.",
    parameters={
        "type": "object",
        "properties": {
            "app_name": {"type": "string", "description": "The name of the application to focus, e.g. 'Google Chrome', 'Visual Studio Code'."}
        },
        "required": ["app_name"]
    },
    permission=PERMISSION_AUTO,
    tags=["vision", "system"]
)
async def focus_app(app_name: str) -> str:
    script = f'tell application "{app_name}" to activate'
    try:
        subprocess.run(["osascript", "-e", script], timeout=5)
        return f"Brought {app_name} to the foreground."
    except Exception as e:
        return f"Failed to focus {app_name}: {e}"
@registry.register(
    name="visual_screen_analysis",
    description="Analyze the current screen visually to see text, buttons, and UI state.",
    parameters={
        "type": "object",
        "properties": {
            "extract_text": {"type": "boolean", "description": "Whether to perform OCR to extract text.", "default": True},
            "detect_elements": {"type": "boolean", "description": "Whether to detect UI elements (icons, windows, buttons).", "default": False}
        }
    },
    permission=PERMISSION_AUTO,
    tags=["vision"]
)
async def visual_screen_analysis(extract_text: bool = True, detect_elements: bool = False) -> str:
    from .analyzer import vision_analyzer
    
    screenshot = vision_analyzer.capture_screen()
    
    results = []
    if extract_text:
        text = vision_analyzer.extract_text(screenshot)
        if text:
            results.append(f"[Detected Text]\n{text[:1000]}") # Limit text for context
        else:
            results.append("[Detected Text]\nNone or Tesseract not installed.")

    if detect_elements:
        elements = vision_analyzer.detect_elements(screenshot)
        if elements:
            results.append(f"\n[Detected UI Elements]")
            for e in elements[:10]:
                results.append(f"  - {e['class']} (conf: {e['conf']:.2f}) at {e['bbox']}")
        else:
            results.append("\n[Detected UI Elements]\nNone or YOLO not loaded.")

    if not results:
        return "No visual analysis performed."
        
    return "\n".join(results)
