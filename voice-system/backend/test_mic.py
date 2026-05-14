"""Task 5 — Test microphone access."""

import sounddevice as sd
import numpy as np

DURATION = 3  # seconds
SAMPLE_RATE = 16000

print("🎤 Recording for 3 seconds...")
print(f"   Sample rate: {SAMPLE_RATE} Hz")
print(f"   Channels: 1 (mono)\n")

recording = sd.rec(
    int(DURATION * SAMPLE_RATE),
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype="float32",
)
sd.wait()

peak = float(np.max(np.abs(recording)))
rms = float(np.sqrt(np.mean(recording**2)))

print(f"✅ Recording complete!")
print(f"   Samples: {recording.shape[0]}")
print(f"   Peak level: {peak:.4f}")
print(f"   RMS level: {rms:.4f}")

if peak < 0.001:
    print("\n⚠️  Very low audio — check mic permissions or input device.")
else:
    print("\n🎙️  Microphone is working!")
