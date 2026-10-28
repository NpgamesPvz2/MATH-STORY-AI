/**
 * Pure Web Audio API Sound Generator
 * Generates clear, child-friendly educational sounds directly in browser without external files
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;

  private getMasterGain(ctx: AudioContext): GainNode {
    if (!this.masterGainNode) {
      this.masterGainNode = ctx.createGain();
      this.masterGainNode.gain.value = this.isBgMuted ? 0 : 1;
      this.masterGainNode.connect(ctx.destination);
    }
    return this.masterGainNode;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pleasant bell chime when video pauses for interactive question
  playDingDong() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(this.getMasterGain(ctx));
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Low bell
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now + 0.15); // A4
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(this.getMasterGain(ctx));
      osc2.start(now + 0.15);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Âm thanh báo hiệu tần số Pitch chuẩn xác bằng Web Audio API ngay khi bấm nghe thử
  playPitchTone(pitch: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Ánh xạ pitch (0.6 -> 1.8) sang tần số nốt nhạc tương ứng (180Hz -> 650Hz)
      const baseFreq = 260;
      const targetFreq = Math.round(baseFreq * Math.max(0.6, Math.min(2.0, pitch)));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq * 1.05, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.getMasterGain(ctx));
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Pitch tone error:', e);
    }
  }

  // Celebratory fanfare when student answers correctly
  playCelebration() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.getMasterGain(ctx));
        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Gentle soft bump when trying again
  playTryAgain() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.3); // C4
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.getMasterGain(ctx));
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Background Music loop synthesizers for educational video playback
  private bgTimer: any = null;
  private bgGainNode: GainNode | null = null;
  private isBgPlaying: boolean = false;
  private isBgMuted: boolean = false;
  private isBgDucked: boolean = false;
  private currentBgTheme: string = 'vui-tuoi';
  private bgVolumeLevel: number = 0.25;

  startBackgroundMusic(theme: string = 'vui-tuoi', volumePercent: number = 25) {
    if (theme === 'khong-nhac') {
      this.stopBackgroundMusic();
      return;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    this.currentBgTheme = theme;
    this.bgVolumeLevel = Math.max(0.01, Math.min(1.0, (volumePercent / 100) * 0.4));

    if (this.isBgPlaying) {
      if (this.bgGainNode) {
        this.bgGainNode.gain.setValueAtTime(this.isBgMuted ? 0 : this.bgVolumeLevel, ctx.currentTime);
      }
      return;
    }

    this.isBgPlaying = true;
    this.playBgMelodyLoop();
  }

  private playBgMelodyLoop() {
    if (!this.isBgPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Create master gain for background music if needed
      if (!this.bgGainNode) {
        this.bgGainNode = ctx.createGain();
        this.bgGainNode.gain.setValueAtTime(this.isBgMuted ? 0 : this.bgVolumeLevel, ctx.currentTime);
        this.bgGainNode.connect(this.getMasterGain(ctx));
      } else {
        this.bgGainNode.gain.setValueAtTime(this.isBgMuted ? 0 : this.bgVolumeLevel, ctx.currentTime);
      }

      // Melodies based on theme
      let notes: { freq: number; dur: number; delay: number }[] = [];
      const bpm = 110;
      const beat = 60 / bpm;

      if (this.currentBgTheme === 'diu-dang') {
        // Soft lullaby / gentle piano: F4, A4, C5, E5, D5, C5, A4
        notes = [
          { freq: 349.23, dur: beat * 1.5, delay: 0 },
          { freq: 440.00, dur: beat * 1.5, delay: beat },
          { freq: 523.25, dur: beat * 2, delay: beat * 2 },
          { freq: 659.25, dur: beat * 2, delay: beat * 3.5 },
          { freq: 587.33, dur: beat * 1.5, delay: beat * 5 },
          { freq: 523.25, dur: beat * 2, delay: beat * 6.5 },
        ];
      } else if (this.currentBgTheme === 'kham-pha') {
        // Inquisitive playful: G4, B4, D5, E5, F#5, G5
        notes = [
          { freq: 392.00, dur: beat * 0.8, delay: 0 },
          { freq: 493.88, dur: beat * 0.8, delay: beat * 0.7 },
          { freq: 587.33, dur: beat * 0.8, delay: beat * 1.4 },
          { freq: 659.25, dur: beat * 1.2, delay: beat * 2.1 },
          { freq: 739.99, dur: beat * 0.8, delay: beat * 3.2 },
          { freq: 783.99, dur: beat * 1.5, delay: beat * 4.0 },
        ];
      } else {
        // 'vui-tuoi' (default upbeat cheerful marimba C major)
        // C4, E4, G4, A4, G4, E4, C5, G4
        notes = [
          { freq: 523.25, dur: beat * 0.6, delay: 0 },
          { freq: 659.25, dur: beat * 0.6, delay: beat * 0.6 },
          { freq: 783.99, dur: beat * 0.6, delay: beat * 1.2 },
          { freq: 880.00, dur: beat * 0.8, delay: beat * 1.8 },
          { freq: 783.99, dur: beat * 0.6, delay: beat * 2.6 },
          { freq: 659.25, dur: beat * 0.6, delay: beat * 3.2 },
          { freq: 1046.50, dur: beat * 1.0, delay: beat * 3.8 },
          { freq: 783.99, dur: beat * 0.8, delay: beat * 4.6 },
        ];
      }

      const totalLoopTime = 5.5; // in seconds

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = this.currentBgTheme === 'diu-dang' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime + n.delay);
        noteGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + n.delay + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.dur);

        osc.connect(noteGain);
        noteGain.connect(this.bgGainNode!);

        osc.start(ctx.currentTime + n.delay);
        osc.stop(ctx.currentTime + n.delay + n.dur + 0.05);
      });

      // Schedule next loop
      this.bgTimer = setTimeout(() => {
        if (this.isBgPlaying) {
          this.playBgMelodyLoop();
        }
      }, totalLoopTime * 1000);
    } catch (e) {
      console.warn('Background music loop error:', e);
    }
  }

  pauseBackgroundMusic() {
    this.isBgPlaying = false;
    if (this.bgTimer) {
      clearTimeout(this.bgTimer);
      this.bgTimer = null;
    }
    if (this.bgGainNode && this.ctx) {
      try {
        this.bgGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgGainNode.gain.setValueAtTime(0.00001, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  resumeBackgroundMusic(theme?: string, volumePercent?: number) {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const themeToUse = theme || this.currentBgTheme;
    if (themeToUse === 'khong-nhac') return;

    if (volumePercent !== undefined) {
      this.bgVolumeLevel = Math.max(0.01, Math.min(1.0, (volumePercent / 100) * 0.4));
    }

    if (this.bgGainNode && this.ctx) {
      try {
        this.bgGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgGainNode.gain.setValueAtTime(this.isBgMuted ? 0 : this.bgVolumeLevel, this.ctx.currentTime);
      } catch (e) {}
    }

    this.isBgPlaying = true;
    this.playBgMelodyLoop();
  }

  stopBackgroundMusic() {
    this.isBgPlaying = false;
    if (this.bgTimer) {
      clearTimeout(this.bgTimer);
      this.bgTimer = null;
    }
    if (this.bgGainNode && this.ctx) {
      try {
        this.bgGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgGainNode.gain.setValueAtTime(0.00001, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  duckBackgroundMusic(duck: boolean) {
    if (!this.bgGainNode || !this.ctx || !this.isBgPlaying) return;
    try {
      this.isBgDucked = duck;
      const targetVol = this.isBgMuted ? 0 : duck ? this.bgVolumeLevel * 0.2 : this.bgVolumeLevel;
      this.bgGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgGainNode.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  stopAll() {
    this.stopBackgroundMusic();
    if (this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend().catch(() => {});
      } catch (e) {}
    }
  }

  setBackgroundMusicVolume(volumePercent: number) {
    this.bgVolumeLevel = Math.max(0.01, Math.min(1.0, (volumePercent / 100) * 0.4));
    if (this.bgGainNode && this.ctx) {
      this.bgGainNode.gain.setValueAtTime(this.isBgMuted ? 0 : this.bgVolumeLevel, this.ctx.currentTime);
    }
  }

  setBackgroundMusicMuted(muted: boolean) {
    this.isBgMuted = muted;
    if (this.ctx) {
      this.getMasterGain(this.ctx).gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    if (this.bgGainNode && this.ctx && this.isBgPlaying) {
      this.bgGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgGainNode.gain.setValueAtTime(this.isBgDucked ? this.bgVolumeLevel * 0.2 : this.bgVolumeLevel, this.ctx.currentTime);
    }
  }
}

export const soundEffects = new SoundEffects();
