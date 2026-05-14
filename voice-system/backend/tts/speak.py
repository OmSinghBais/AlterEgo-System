"""
Task 13 — Text-to-speech via ElevenLabs.

Streams synthesized audio to the speaker.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from elevenlabs import ElevenLabs, play

API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_monolingual_v1")

if not API_KEY:
    print("❌ ELEVENLABS_API_KEY not set in .env")
    sys.exit(1)

client = ElevenLabs(api_key=API_KEY)


def speak(text: str, voice_id: str = VOICE_ID) -> None:
    """Synthesize text and play it through the speaker."""
    print(f"🔊 Speaking: \"{text[:80]}{'...' if len(text) > 80 else ''}\"")

    audio = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=MODEL_ID,
        output_format="mp3_44100_128",
    )

    play(audio)
    print("✅ Done speaking.")


def speak_stream(text: str, voice_id: str = VOICE_ID):
    """Synthesize and return audio bytes (for WebSocket streaming)."""
    audio = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=MODEL_ID,
        output_format="mp3_44100_128",
    )
    # Collect all chunks into bytes
    chunks = []
    for chunk in audio:
        if isinstance(chunk, bytes):
            chunks.append(chunk)
    return b"".join(chunks)


if __name__ == "__main__":
    test_text = "Hello, I am AlterEGO. Your cinematic intelligence is now online."
    speak(test_text)
