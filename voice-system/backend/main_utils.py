import threading
import time
import subprocess
import asyncio
import orjson
from utils.logger import logger, log_ws_event
from config.settings import get_settings
from api.state import subsystem_status, conversation_active, connected_clients

settings = get_settings()

def start_wakeword_thread():
    threading.Thread(target=_wakeword_listener, daemon=True).start()

def _wakeword_listener():
    import sounddevice as sd
    import numpy as np
    try:
        import pvporcupine
    except ImportError:
        logger.warning("pvporcupine not installed — wake word disabled.")
        return

    if not settings.PICOVOICE_API_KEY:
        logger.warning("PICOVOICE_API_KEY missing — wake word disabled.")
        return

    try:
        # Use built-in keywords or custom ones if available
        # Defaulting to 'jarvis' or 'computer' or 'porcupine'
        keywords = ["jarvis", "computer"] if "jarvis" in pvporcupine.KEYWORDS else ["porcupine"]
        handle = pvporcupine.create(access_key=settings.PICOVOICE_API_KEY, keywords=keywords)
        logger.info(f"Picovoice Porcupine loaded with keywords: {keywords}")
    except Exception as e:
        logger.error(f"Failed to initialize Porcupine: {e}")
        return

    subsystem_status["wakeword"] = "online"
    last_trigger = 0.0
    WAKEWORD_COOLDOWN = 2.0 # Default cooldown

    async def broadcast_wake_word(keyword: str):
        msg = orjson.dumps({
            "type": "wake_word_detected",
            "keyword": keyword,
            "timestamp": time.time()
        })
        for ws in list(connected_clients):
            try:
                await ws.send_bytes(msg)
            except Exception:
                connected_clients.discard(ws)

    def on_audio(indata, frames, time_info, status):
        nonlocal last_trigger
        if conversation_active:
            return

        # Porcupine expects int16
        audio_int16 = (indata.flatten() * 32768).astype(np.int16)
        result = handle.process(audio_int16)

        if result >= 0:
            now = time.time()
            if now - last_trigger < WAKEWORD_COOLDOWN:
                return
            last_trigger = now
            
            keyword = keywords[result]
            logger.info(f"🔥 Wake word detected: {keyword}")

            # Trigger broadcast in main loop
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.run_coroutine_threadsafe(broadcast_wake_word(keyword), loop)
            except Exception as e:
                logger.error(f"Failed to broadcast wake word: {e}")

    try:
        with sd.InputStream(
            samplerate=handle.sample_rate,
            channels=1,
            dtype="float32",
            blocksize=handle.frame_length,
            callback=on_audio,
        ):
            while True:
                time.sleep(0.1)
    except Exception as e:
        logger.error(f"Audio stream error: {e}")
    finally:
        handle.delete()
