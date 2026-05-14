export class AudioQueueManager {
  private queue: string[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private onStartPlaying: ((audio: HTMLAudioElement) => void) | null = null;
  private onQueueEmpty: (() => void) | null = null;

  constructor(
    onStartPlaying?: (audio: HTMLAudioElement) => void,
    onQueueEmpty?: () => void
  ) {
    if (onStartPlaying) this.onStartPlaying = onStartPlaying;
    if (onQueueEmpty) this.onQueueEmpty = onQueueEmpty;
  }

  public enqueue(blobUrl: string) {
    this.queue.push(blobUrl);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentAudio = null;
      if (this.onQueueEmpty) this.onQueueEmpty();
      return;
    }

    this.isPlaying = true;
    const url = this.queue.shift()!;
    this.currentAudio = new Audio(url);
    this.currentAudio.crossOrigin = "anonymous";
    
    if (this.onStartPlaying) {
      this.onStartPlaying(this.currentAudio);
    }

    this.currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      this.playNext();
    };

    this.currentAudio.play().catch((err) => {
      console.warn("Audio playback prevented:", err);
      URL.revokeObjectURL(url);
      this.playNext();
    });
  }

  public interrupt() {
    this.queue.forEach((url) => URL.revokeObjectURL(url));
    this.queue = [];
    
    if (this.currentAudio) {
      // Smooth fade out could also be implemented here or outside
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  public getCurrentAudio() {
    return this.currentAudio;
  }
}
