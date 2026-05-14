"""
Task 7 — Live transcription with faster-whisper.

Captures audio in chunks via sounddevice, feeds them to Whisper for
realtime speech-to-text. Silence detection stops the recording.
"""

import sys
import queue
import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel

SAMPLE_RATE = 16000
CHUNK_DURATION = 2  # seconds per chunk
SILENCE_THRESHOLD = 0.01
MAX_SILENCE_CHUNKS = 3  # stop after this many consecutive silent chunks

# Load model (downloads on first run — ~150 MB for base.en)
print("⏳ Loading Whisper model (base.en)...")
model = WhisperModel("base.en", device="cpu", compute_type="int8")
print("✅ Model loaded!\n")

audio_queue: queue.Queue[np.ndarray] = queue.Queue()


def audio_callback(indata: np.ndarray, frames: int, time_info: dict, status: sd.CallbackFlags) -> None:
    """Called by sounddevice for each audio chunk."""
    if status:
        print(f"⚠️  Audio status: {status}", file=sys.stderr)
    audio_queue.put(indata.copy())


def transcribe_stream() -> None:
    """Main loop: capture audio chunks and transcribe."""
    chunk_samples = int(CHUNK_DURATION * SAMPLE_RATE)

    print("🎤 Listening... (speak now, silence stops recording)\n")

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="float32",
        blocksize=chunk_samples,
        callback=audio_callback,
    ):
        silence_count = 0
        while True:
            try:
                audio_chunk = audio_queue.get(timeout=CHUNK_DURATION + 1)
            except queue.Empty:
                break

            # Check for silence
            rms = float(np.sqrt(np.mean(audio_chunk**2)))
            if rms < SILENCE_THRESHOLD:
                silence_count += 1
                if silence_count >= MAX_SILENCE_CHUNKS:
                    print("\n🔇 Silence detected — stopping.")
                    break
                continue
            else:
                silence_count = 0

            # Transcribe
            audio_flat = audio_chunk.flatten().astype(np.float32)
            segments, info = model.transcribe(
                audio_flat,
                beam_size=5,
                language="en",
                vad_filter=True,
            )

            for segment in segments:
                text = segment.text.strip()
                if text:
                    print(f"📝 [{segment.start:.1f}s-{segment.end:.1f}s] {text}")


if __name__ == "__main__":
    try:
        transcribe_stream()
    except KeyboardInterrupt:
        print("\n\n👋 Stopped by user.")
