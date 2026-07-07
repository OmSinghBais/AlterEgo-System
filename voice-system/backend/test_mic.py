import sounddevice as sd
import numpy as np

def list_devices():
    print("Available Audio Devices:")
    print(sd.query_devices())
    print(f"\nDefault Input Device: {sd.default.device[0]}")

def monitor_mic():
    print("\nMonitoring Default Mic (Ctrl+C to stop)...")
    def callback(indata, frames, time, status):
        volume_norm = np.linalg.norm(indata) * 10
        print(f"|{'#' * int(volume_norm)}", end='\r')

    try:
        with sd.InputStream(callback=callback, channels=1):
            sd.sleep(100000)
    except KeyboardInterrupt:
        print("\nStopped.")

if __name__ == "__main__":
    list_devices()
    monitor_mic()
