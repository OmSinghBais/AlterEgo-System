"use client";

class AudioQueue {
  private queue: string[] = [];
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  async enqueue(audioUrl: string) {
    this.queue.push(audioUrl);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const url = this.queue.shift()!;
    
    this.currentAudio = new Audio(url);
    this.currentAudio.onended = () => this.playNext();
    this.currentAudio.onerror = () => this.playNext();
    
    try {
      await this.currentAudio.play();
    } catch (e) {
      console.error("Audio playback failed:", e);
      this.playNext();
    }
  }

  interrupt() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.queue = [];
    this.isPlaying = false;
  }
}

export const audioQueue = new AudioQueue();
