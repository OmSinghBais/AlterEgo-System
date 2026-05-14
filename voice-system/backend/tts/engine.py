"""
AlterEGO — TTS Engine (ElevenLabs)

Task 5: Streaming audio synthesis.
"""

import time
from elevenlabs import ElevenLabs
from config import ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID
from utils.logger import logger, log_latency

_client: ElevenLabs | None = None


def get_client() -> ElevenLabs:
    global _client
    if _client is None:
        _client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    return _client


def synthesize(text: str, voice_id: str | None = None) -> bytes:
    """Synthesize text to MP3 audio bytes."""
    t0 = time.perf_counter()
    client = get_client()
    vid = voice_id or ELEVENLABS_VOICE_ID

    audio = client.text_to_speech.convert(
        text=text,
        voice_id=vid,
        model_id=ELEVENLABS_MODEL_ID,
        output_format="mp3_44100_128",
    )

    chunks = []
    for chunk in audio:
        if isinstance(chunk, bytes):
            chunks.append(chunk)

    result = b"".join(chunks)
    elapsed = (time.perf_counter() - t0) * 1000
    log_latency("TTS", elapsed)
    logger.debug(f"TTS output: {len(result)} bytes for {len(text)} chars")
    return result


def synthesize_streaming(text: str, voice_id: str | None = None):
    """Yield MP3 audio chunks as they arrive from ElevenLabs."""
    client = get_client()
    vid = voice_id or ELEVENLABS_VOICE_ID

    audio = client.text_to_speech.convert(
        text=text,
        voice_id=vid,
        model_id=ELEVENLABS_MODEL_ID,
        output_format="mp3_44100_128",
    )

    for chunk in audio:
        if isinstance(chunk, bytes):
            yield chunk
