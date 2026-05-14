"""
Task 21-23 — Wake word detection using openWakeWord.

Listens continuously for "hey jarvis" (built-in model closest to AlterEGO).
When detected, sends a signal to trigger the voice pipeline.
"""

import sys
import time
import numpy as np
import sounddevice as sd

from utils.logger import logger

try:
    from openwakeword.model import Model as OWWModel
except ImportError:
    logger.error("Install openwakeword: pip install openwakeword")
    sys.exit(1)

SAMPLE_RATE = 16000
CHUNK_SIZE = 1280  # ~80ms at 16kHz — recommended by openwakeword
THRESHOLD = 0.5


def listen_for_wakeword(
    callback=None,
    model_names: list[str] | None = None,
):
    """
    Block and listen for a wake word. When detected, call `callback`.
    If no callback, just print detection.

    Args:
        callback: Function to call when wake word detected. Receives (model_name, score).
        model_names: List of openwakeword model names to load. Default: ["hey_jarvis_v0.1"]
    """
    if model_names is None:
        model_names = ["hey_jarvis_v0.1"]

    logger.info(f"Loading wake word models: {model_names}")
    # Auto-download models if not present
    try:
        from openwakeword import utils as oww_utils
        oww_utils.download_models()
    except Exception:
        pass
    oww_model = OWWModel(wakeword_models=model_names, inference_framework="onnx")
    logger.info("Wake word listener ready!")
    logger.info(f"Listening for wake word... (threshold: {THRESHOLD})")

    def audio_callback(indata: np.ndarray, frames: int, time_info, status):
        if status:
            print(f"⚠️  {status}", file=sys.stderr)

        # Feed audio to model
        audio_int16 = (indata.flatten() * 32768).astype(np.int16)
        oww_model.predict(audio_int16)

        # Check predictions
        for model_name in oww_model.prediction_buffer.keys():
            scores = list(oww_model.prediction_buffer[model_name])
            if scores and scores[-1] > THRESHOLD:
                logger.info(f"Wake word detected! Model: {model_name}, Score: {scores[-1]:.3f}")
                oww_model.reset()
                if callback:
                    callback(model_name, scores[-1])

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="float32",
        blocksize=CHUNK_SIZE,
        callback=audio_callback,
    ):
        try:
            while True:
                time.sleep(0.1)
        except KeyboardInterrupt:
            print("\n👋 Wake word listener stopped.")


if __name__ == "__main__":
    def on_wake(model_name: str, score: float):
        print(f"   → Would trigger voice pipeline now!")
        print(f"   → Resuming listening...\n")

    listen_for_wakeword(callback=on_wake)
