import threading
import time
import subprocess
import asyncio
import orjson
from utils.logger import logger, log_ws_event
from api.state import subsystem_status, conversation_active, connected_clients
from config import WAKEWORD_MODELS, WAKEWORD_THRESHOLD, WAKEWORD_COOLDOWN, FRONTEND_URL

def start_wakeword_thread():
    threading.Thread(target=_wakeword_listener, daemon=True).start()

def _wakeword_listener():
    import sounddevice as sd
    try:
        from openwakeword.model import Model as OWWModel
        from openwakeword import utils as oww_utils
    except ImportError:
        logger.warning("openwakeword not installed — wake word disabled.")
        return

    try:
        oww_utils.download_models()
    except Exception:
        pass

    logger.info(f"Loading wake word models: {WAKEWORD_MODELS}")
    oww_model = OWWModel(wakeword_models=WAKEWORD_MODELS, inference_framework="onnx")
    subsystem_status["wakeword"] = "online"
    logger.info("Wake word listener active.")

    CHUNK = 1280
    last_trigger = 0.0

    async def broadcast_wake_word(model_name: str):
        """Send wake word detection to all connected clients."""
        msg = orjson.dumps({
            "type": "wake_word_detected",
            "model": model_name,
            "timestamp": time.time()
        })
        disconnected = set()
        for ws in list(connected_clients):
            try:
                await ws.send_bytes(msg)
            except Exception:
                disconnected.add(ws)
        
        for ws in disconnected:
            connected_clients.discard(ws)

    def on_audio(indata, frames, time_info, status):
        nonlocal last_trigger
        import numpy as _np

        # If already talking, don't trigger wake word
        if conversation_active:
            return

        audio_int16 = (indata.flatten() * 32768).astype(_np.int16)
        oww_model.predict(audio_int16)

        for name in oww_model.prediction_buffer.keys():
            scores = list(oww_model.prediction_buffer[name])
            if scores and scores[-1] > WAKEWORD_THRESHOLD:
                now = time.time()
                if now - last_trigger < WAKEWORD_COOLDOWN:
                    oww_model.reset()
                    return
                last_trigger = now
                logger.info(f"Wake word detected: {name} (score: {scores[-1]:.3f})")
                oww_model.reset()

                # 1. Trigger WebSocket event
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(broadcast_wake_word(name))
                except Exception as e:
                    logger.error(f"Failed to broadcast wake word: {e}")

                # 2. Local fallback (open browser)
                try:
                    subprocess.Popen(["open", "-a", "Google Chrome", f"{FRONTEND_URL}/dashboard"])
                except Exception:
                    pass

    with sd.InputStream(
        samplerate=16000, channels=1, dtype="float32",
        blocksize=CHUNK, callback=on_audio,
    ):
        while True:
            time.sleep(0.1)
