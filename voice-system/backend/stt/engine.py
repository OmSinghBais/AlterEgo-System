"""
AlterEGO — STT Engine (faster-whisper)

Task 4: Chunked transcription with low latency.
"""

import numpy as np
from config import SAMPLE_RATE, WHISPER_MODEL, WHISPER_DEVICE, WHISPER_COMPUTE
from utils.logger import logger, log_latency
import time

_model = None


def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        logger.info(f"Loading Whisper model: {WHISPER_MODEL} ({WHISPER_DEVICE}/{WHISPER_COMPUTE})")
        _model = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE)
        logger.info("Whisper model loaded.")
    return _model


def transcribe(audio_bytes: bytes) -> str:
    """Transcribe raw PCM16 audio bytes to text."""
    t0 = time.perf_counter()
    model = get_model()
    audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    # Skip very short audio (< 300ms)
    if len(audio_np) < SAMPLE_RATE * 0.3:
        return ""

    segments, info = model.transcribe(
        audio_np,
        beam_size=5,
        language="en",
        vad_filter=True,
        vad_parameters=dict(
            min_silence_duration_ms=300,
            speech_pad_ms=200,
        ),
    )

    parts = []
    for seg in segments:
        t = seg.text.strip()
        if t:
            parts.append(t)

    result = " ".join(parts)
    elapsed = (time.perf_counter() - t0) * 1000
    log_latency("STT", elapsed)
    return result
