"""
AlterEGO — STT Engine (Whisper & Deepgram)
"""

import time
import numpy as np
from config.settings import get_settings
from utils.logger import logger, log_latency

settings = get_settings()
_whisper_model = None
_deepgram_client = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        logger.info(f"Loading Whisper: {settings.WHISPER_MODEL}")
        _whisper_model = WhisperModel(
            settings.WHISPER_MODEL, 
            device=settings.WHISPER_DEVICE, 
            compute_type=settings.WHISPER_COMPUTE
        )
    return _whisper_model

def get_model():
    """Alias for get_whisper_model for backward compatibility."""
    return get_whisper_model()

def get_deepgram_client():
    global _deepgram_client
    if _deepgram_client is None:
        from deepgram import DeepgramClient
        _deepgram_client = DeepgramClient(settings.DEEPGRAM_API_KEY)
    return _deepgram_client

def transcribe(audio_bytes: bytes) -> str:
    """Transcribe audio using the configured engine."""
    if settings.STT_ENGINE == "deepgram" and settings.DEEPGRAM_API_KEY:
        return _transcribe_deepgram(audio_bytes)
    return _transcribe_whisper(audio_bytes)

def _transcribe_deepgram(audio_bytes: bytes) -> str:
    t0 = time.perf_counter()
    try:
        from deepgram import PrerecordedOptions
        client = get_deepgram_client()
        
        source = {"buffer": audio_bytes}
        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
        )
        
        response = client.listen.rest.v("1").transcribe_file(source, options)
        result = response.results.channels[0].alternatives[0].transcript
        
        elapsed = (time.perf_counter() - t0) * 1000
        log_latency("STT_Deepgram", elapsed)
        return result
    except Exception as e:
        logger.error(f"Deepgram error: {e}. Falling back to Whisper.")
        return _transcribe_whisper(audio_bytes)

def _transcribe_whisper(audio_bytes: bytes) -> str:
    t0 = time.perf_counter()
    model = get_whisper_model()
    audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    if len(audio_np) < 16000 * 0.3: # SAMPLE_RATE = 16000
        return ""

    segments, _ = model.transcribe(audio_np, beam_size=5, language="en", vad_filter=True)
    result = " ".join([seg.text.strip() for seg in segments if seg.text.strip()])
    
    elapsed = (time.perf_counter() - t0) * 1000
    log_latency("STT_Whisper", elapsed)
    return result
