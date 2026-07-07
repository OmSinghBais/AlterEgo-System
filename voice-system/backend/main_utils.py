import threading
import time
import asyncio
import orjson
import numpy as np
import pyaudio
from utils.logger import logger
from config.settings import get_settings
from api.state import subsystem_status, conversation_active, connected_clients

settings = get_settings()

def start_wakeword_thread():
    threading.Thread(target=_wakeword_listener, daemon=True).start()

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

def _wakeword_listener():
    if not settings.ENABLE_WAKEWORD:
        return

    try:
        from openwakeword.model import Model
        model_paths = settings.WAKEWORD_MODELS
        model = Model(wakeword_models=model_paths, inference_framework="onnx")
        logger.info(f"🎙️ OpenWakeWord Online (PyAudio) | Threshold: {settings.WAKEWORD_THRESHOLD}")

        p = pyaudio.PyAudio()
        
        # Diagnostic: Log default device
        try:
            default_device = p.get_default_input_device_info()
            logger.info(f"🎙️ Using Default Mic: {default_device['name']}")
        except:
            logger.error("🎙️ No default input device found!")
            return

        stream = p.open(
            format=pyaudio.paFloat32,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=1280
        )

        last_vol_log = 0

        while True:
            if conversation_active:
                time.sleep(0.5)
                continue
            
            try:
                data = stream.read(1280, exception_on_overflow=False)
                audio_data = np.frombuffer(data, dtype=np.float32)
                
                # Volume Diagnostic
                now = time.time()
                if now - last_vol_log > 3.0:
                    vol = np.abs(audio_data).mean()
                    logger.debug(f"🎙️ Mic Check | Vol: {vol:.4f}")
                    last_vol_log = now

                model.predict(audio_data)
                
                for mdl, score in model.prediction_buffer.items():
                    if score[-1] >= settings.WAKEWORD_THRESHOLD:
                        logger.info(f"🔥 WAKE WORD DETECTED: {mdl} ({score[-1]:.2f})")
                        _trigger_broadcast(mdl)
                        model.reset()
            except Exception as e:
                logger.error(f"Stream read error: {e}")
                time.sleep(0.1)

    except Exception as e:
        logger.error(f"Wake word error: {e}")

def _trigger_broadcast(keyword: str):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(broadcast_wake_word(keyword), loop)
    except Exception as e:
        logger.error(f"Broadcast error: {e}")
