import base64
import json
from pathlib import Path
from core.settings import get_settings
from core.logger import logger
from tools.registry import registry, PERMISSION_AUTO

settings = get_settings()

def encode_image(image_path: Path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@registry.register(
    name="analyze_screen",
    description="Analyze the current desktop screen or a specific screenshot to understand UI, text, or visual content.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "What to look for on the screen?"},
            "image_path": {"type": "string", "description": "Optional path to a specific image. If empty, takes a new screenshot."}
        },
        "required": ["query"]
    },
    permission=PERMISSION_AUTO,
    tags=["vision", "system"]
)
async def analyze_screen(query: str, image_path: str = None) -> str:
    from llm import get_client
    from vision.screen_capture import capture_screen
    
    client = get_client()
    
    if not image_path:
        path = capture_screen()
    else:
        path = Path(image_path)
    
    if not path or not path.exists():
        return "Error: Could not capture or find screen image."

    base64_image = encode_image(path)
    
    # 🛰️ Check if we should offload to Modal Cloud
    if settings.USE_MODAL_VISION:
        from modal_bridge.bridge import call_modal_vision
        logger.info("🛰️ Offloading vision analysis to Modal GPU...")
        result = call_modal_vision(base64_image, query)
        if result:
            return result
        logger.warning("🛰️ Modal failed, falling back to local vision...")

    try:
        response = await client.chat.completions.create(
            model="gpt-4o", # Vision capable model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Analyze this desktop screenshot and answer: {query}"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Vision analysis failed: {e}")
        return f"Analysis failed: {e}"
