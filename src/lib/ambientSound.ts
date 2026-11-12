// Web Audio API ambient sound generator (Rain, Fireplace crackle, Night wind)
// Lightweight, zero external audio asset dependency, runs seamlessly in any modern browser.

class AmbientSoundEngine {
  private audioCtx: AudioContext | null = null;
  private currentType: "none" | "rain" | "fire" | "wind" = "none";
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;

  private initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public play(type: "none" | "rain" | "fire" | "wind") {
    this.stop();
    if (type === "none") {
      this.currentType = "none";
      return;
    }

    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.currentType = type;
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink / Brown noise synthesis
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "rain") {
          // Pink noise filter for rain
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else if (type === "wind") {
          // Low brown noise for night wind
          lastOut = (lastOut + 0.01 * white) / 1.01;
          data[i] = lastOut * 4.0;
        } else {
          // Fireplace crackle & warm hiss
          const crackle = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 2.5 : 0;
          lastOut = (lastOut + 0.03 * white) / 1.03;
          data[i] = lastOut * 2.5 + crackle;
        }
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Bandpass / Lowpass filter for natural sound
      const filter = this.audioCtx.createBiquadFilter();
      if (type === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
      } else if (type === "wind") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      } else {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        filter.Q.setValueAtTime(0.7, this.audioCtx.currentTime);
      }

      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();
      this.noiseNode = noise;
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public stop() {
    try {
      if (this.noiseNode) {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch {
      // Ignore cleanup error
    }
    this.currentType = "none";
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.audioCtx && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public getCurrentType() {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundEngine();
