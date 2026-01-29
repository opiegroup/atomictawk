// Game Audio System using Web Audio API
// Uses synthesized sounds - no external files needed

class GameAudio {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicInterval: NodeJS.Timeout | null = null;
  private musicBeat: number = 0;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
  
  isMusicPlaying() {
    return this.musicEnabled;
  }
  
  // Annoying "BOSCOTEK" jingle - catchy and repetitive!
  toggleMusic() {
    if (this.musicEnabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicEnabled;
  }
  
  private startMusic() {
    if (!this.enabled) return;
    this.musicEnabled = true;
    this.musicBeat = 0;
    
    // Play immediately
    this.playMusicBeat();
    
    // Loop every 200ms for fast annoying tempo
    this.musicInterval = setInterval(() => {
      if (this.enabled && this.musicEnabled) {
        this.playMusicBeat();
      }
    }, 200);
  }
  
  stopMusic() {
    this.musicEnabled = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
  
  private playMusicBeat() {
    try {
      const ctx = this.getContext();
      const beat = this.musicBeat % 16; // 16 beat loop
      
      // "BOS-CO-TEK! BOS-CO-TEK! BOS-CO-TEK-TEK-TEK!"
      // Phonetic melody that sounds like the word
      const melody: { [key: number]: { freq: number; type: OscillatorType; duration: number; volume: number } | null } = {
        0: { freq: 98, type: 'sawtooth', duration: 0.15, volume: 0.3 },      // BOS (low B)
        1: { freq: 130.81, type: 'square', duration: 0.12, volume: 0.25 },   // CO (C)
        2: { freq: 329.63, type: 'square', duration: 0.08, volume: 0.2 },    // TEK (E staccato)
        3: null, // rest
        4: { freq: 98, type: 'sawtooth', duration: 0.15, volume: 0.3 },      // BOS
        5: { freq: 130.81, type: 'square', duration: 0.12, volume: 0.25 },   // CO  
        6: { freq: 329.63, type: 'square', duration: 0.08, volume: 0.2 },    // TEK
        7: null, // rest
        8: { freq: 98, type: 'sawtooth', duration: 0.15, volume: 0.3 },      // BOS
        9: { freq: 130.81, type: 'square', duration: 0.12, volume: 0.25 },   // CO
        10: { freq: 329.63, type: 'square', duration: 0.06, volume: 0.2 },   // TEK
        11: { freq: 392.00, type: 'square', duration: 0.06, volume: 0.2 },   // TEK (higher G)
        12: { freq: 493.88, type: 'square', duration: 0.08, volume: 0.25 },  // TEK! (B - triumphant)
        13: null, // rest
        14: null, // rest  
        15: null, // rest - build anticipation
      };
      
      const note = melody[beat];
      
      if (note) {
        // Main melody note
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = note.type;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(note.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.duration);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + note.duration);
        
        // Add annoying harmony on BOS notes
        if (beat === 0 || beat === 4 || beat === 8) {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(note.freq * 2, ctx.currentTime); // Octave up
          gain2.gain.setValueAtTime(0.1, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.1);
        }
      }
      
      // Add bass drum on beats 0, 4, 8, 12
      if (beat % 4 === 0) {
        const kick = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.frequency.setValueAtTime(150, ctx.currentTime);
        kick.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        kickGain.gain.setValueAtTime(0.4, ctx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        kick.start(ctx.currentTime);
        kick.stop(ctx.currentTime + 0.1);
      }
      
      // Hi-hat on off-beats for extra annoyance
      if (beat % 2 === 1) {
        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noise.type = 'square';
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.frequency.setValueAtTime(8000, ctx.currentTime);
        noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.03);
      }
      
      this.musicBeat++;
    } catch (e) {}
  }

  // Click/Select sound - short blip
  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // Add item sound - positive chime
  playAddItem() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      // Second note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.25);

      // Third note
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain3.gain.setValueAtTime(0.3, ctx.currentTime + 0.16);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc3.start(ctx.currentTime + 0.16);
      osc3.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Remove item sound - descending tone
  playRemoveItem() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Error sound - buzzer
  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Success/Complete sound - triumphant fanfare
  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + (i * 0.12);
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }

  // Start game sound - power up
  playStart() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // Hover sound - subtle tick
  playHover() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // Tab switch sound
  playTab() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }
  
  // Grinding/Working sound - mechanical ratcheting
  playGrinding() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      
      // Create grinding noise with modulated frequency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      // LFO for grinding vibrato effect
      lfo.frequency.setValueAtTime(25, ctx.currentTime); // Fast wobble
      lfoGain.gain.setValueAtTime(30, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      lfo.start(ctx.currentTime);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
      lfo.stop(ctx.currentTime + 0.15);
      
      // Add metallic clank
      const clank = ctx.createOscillator();
      const clankGain = ctx.createGain();
      clank.type = 'square';
      clank.frequency.setValueAtTime(800, ctx.currentTime);
      clank.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      clank.connect(clankGain);
      clankGain.connect(ctx.destination);
      clankGain.gain.setValueAtTime(0.1, ctx.currentTime);
      clankGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      clank.start(ctx.currentTime);
      clank.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }
  
  // Engine start sound - vroom vroom!
  playEngineStart() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      
      // Engine crank attempt sounds
      for (let i = 0; i < 3; i++) {
        const crank = ctx.createOscillator();
        const crankGain = ctx.createGain();
        crank.type = 'sawtooth';
        crank.connect(crankGain);
        crankGain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + (i * 0.3);
        crank.frequency.setValueAtTime(80, startTime);
        crank.frequency.exponentialRampToValueAtTime(120, startTime + 0.15);
        crank.frequency.exponentialRampToValueAtTime(60, startTime + 0.25);
        
        crankGain.gain.setValueAtTime(0.2, startTime);
        crankGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
        
        crank.start(startTime);
        crank.stop(startTime + 0.25);
      }
      
      // Engine catches and revs up!
      const engine = ctx.createOscillator();
      const engineGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      // Vibrato for engine rumble
      lfo.frequency.setValueAtTime(15, ctx.currentTime + 0.9);
      lfoGain.gain.setValueAtTime(20, ctx.currentTime + 0.9);
      lfo.connect(lfoGain);
      lfoGain.connect(engine.frequency);
      
      engine.type = 'sawtooth';
      engine.connect(engineGain);
      engineGain.connect(ctx.destination);
      
      // Rev up!
      engine.frequency.setValueAtTime(60, ctx.currentTime + 0.9);
      engine.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5);
      engine.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 2.0);
      engine.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 2.5);
      
      engineGain.gain.setValueAtTime(0.01, ctx.currentTime + 0.9);
      engineGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.2);
      engineGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2.0);
      engineGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.8);
      
      lfo.start(ctx.currentTime + 0.9);
      engine.start(ctx.currentTime + 0.9);
      engine.stop(ctx.currentTime + 2.8);
      lfo.stop(ctx.currentTime + 2.8);
      
      // Victory fanfare overlay
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startTime = ctx.currentTime + 1.0 + (i * 0.15);
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }
  
  // Level up / Room unlocked sound
  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      
      // Ascending arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + (i * 0.08);
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
      
      // Big final chord
      [523.25, 659.25, 783.99].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + 0.5;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
        
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } catch (e) {}
  }
}

// Singleton instance
export const gameAudio = new GameAudio();
