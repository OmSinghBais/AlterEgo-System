import modal
from utils.logger import logger

def call_modal_vision(image_b64: str, prompt: str = "Analyze this screen capture for any important details."):
    """
    Bridge to call the Modal-hosted vision analysis.
    """
    try:
        # Connect to the deployed Modal function
        f = modal.Function.lookup("alterego-intelligence", "analyze_screen_remote")
        
        logger.info("🛰️ Routing Vision request to Modal Cloud...")
        result = f.remote(image_b64, prompt)
        
        return result
    except Exception as e:
        logger.error(f"Modal Bridge Error: {e}")
        return None

def check_modal_health():
    try:
        f = modal.Function.lookup("alterego-intelligence", "ping")
        return f.remote() == "Pong from Modal Cloud"
    except:
        return False
