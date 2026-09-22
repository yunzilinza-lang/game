// Procedural Sound Engine using Web Audio API for Zero-External-Asset Sound & Radio

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Engine sound nodes
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private isEngineRunning: boolean = false;

  // Siren nodes
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: any = null;
  private isSirenActive: boolean = false;

  // Radio synthesizer
  private currentStationIndex: number = 0;
  private isRadioPlaying: boolean = false;
  private radioTimer: any = null;
  private radioGain: GainNode | null = null;

  public readonly stations = [
    { id: 'vanta_fm', name: 'VANTA FM', genre: 'Synthwave & Retrowave', freq: '102.4' },
    { id: 'city_beats', name: 'CITY BEATS', genre: 'Lo-Fi Urban Beats', freq: '94.8' },
    { id: 'night_drive', name: 'NIGHT DRIVE', genre: 'Dark Electronic', freq: '107.1' },
    { id: 'underground', name: 'UNDERGROUND', genre: 'Raw Club Bass', freq: '88.5' },
  ];

  constructor() {
    // Lazy init on first user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Radio gain
        this.radioGain = this.ctx.createGain();
        this.radioGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.radioGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureAudio() {
    this.init();
  }

  public setMasterVolume(vol: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- UI & Interaction Sounds ---
  public playUI(type: 'click' | 'open' | 'close' | 'cash' | 'complete' | 'checkpoint' | 'heat' | 'error') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'open') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'close') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'cash') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'checkpoint') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.09);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'complete') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + i * 0.12);
        g.gain.setValueAtTime(0.3, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);
        o.connect(g);
        g.connect(this.masterGain!);
        o.start(now + i * 0.12);
        o.stop(now + i * 0.12 + 0.35);
      });
    } else if (type === 'heat') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }

  // --- Combat Sounds ---
  public playWeapon(type: 'fists' | 'pistol' | 'shotgun' | 'rifle' | 'smg' | 'spray_can' | 'dual_pistols') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    if (type === 'fists') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.14);
      return;
    }

    if (type === 'spray_can') {
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.setValueAtTime(3200, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      src.connect(f);
      f.connect(g);
      g.connect(this.masterGain);
      src.start(now);
      return;
    }

    // Gunshot: Noise burst + low pitch punch
    const bufferSize = this.ctx.sampleRate * (type === 'shotgun' ? 0.35 : type === 'smg' ? 0.12 : type === 'rifle' ? 0.18 : 0.22);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = type === 'shotgun' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'shotgun' ? 800 : type === 'smg' ? 1800 : type === 'rifle' ? 1400 : 1200, now);

    const noiseGain = this.ctx.createGain();
    const peakGain = type === 'shotgun' ? 0.7 : type === 'rifle' ? 0.45 : type === 'smg' ? 0.38 : 0.5;
    noiseGain.gain.setValueAtTime(peakGain, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + (type === 'shotgun' ? 0.3 : type === 'smg' ? 0.1 : 0.16));

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);

    // Punch sub oscillator
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(type === 'shotgun' ? 180 : 260, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.15);
  }

  public playHit() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playDeath() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  // --- Vehicle Engine Simulation ---
  public startEngine() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isEngineRunning) return;

    this.isEngineRunning = true;
    const now = this.ctx.currentTime;

    this.engineOsc = this.ctx.createOscillator();
    this.engineSubOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineSubOsc.type = 'triangle';

    this.engineOsc.frequency.setValueAtTime(55, now);
    this.engineSubOsc.frequency.setValueAtTime(27.5, now);

    this.engineGain.gain.setValueAtTime(0.2, now);

    this.engineOsc.connect(this.engineGain);
    this.engineSubOsc.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start(now);
    this.engineSubOsc.start(now);
  }

  public updateEngine(speedNormalized: number, isAccelerating: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.isEngineRunning) return;

    const baseFreq = 50 + speedNormalized * 160 + (isAccelerating ? 25 : 0);
    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.08);
    }
    const targetGain = this.isMuted ? 0 : (0.15 + speedNormalized * 0.18 + (isAccelerating ? 0.08 : 0));
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.1);
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    this.isEngineRunning = false;
    try {
      if (this.engineOsc) this.engineOsc.stop();
      if (this.engineSubOsc) this.engineSubOsc.stop();
    } catch {}
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineGain = null;
  }

  public playCarTireSkid() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playCarCrash() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playPoliceSiren() {
    this.setSirenActive(true);
    setTimeout(() => {
      this.setSirenActive(false);
    }, 4500);
  }

  public setSirenActive(active: boolean) {
    if (active === this.isSirenActive) return;
    this.isSirenActive = active;

    if (!active) {
      if (this.sirenInterval) {
        clearInterval(this.sirenInterval);
        this.sirenInterval = null;
      }
      if (this.sirenOsc) {
        try { this.sirenOsc.stop(); } catch {}
        this.sirenOsc = null;
      }
      this.sirenGain = null;
      return;
    }

    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.sirenOsc = this.ctx.createOscillator();
    this.sirenGain = this.ctx.createGain();

    this.sirenOsc.type = 'sine';
    this.sirenOsc.frequency.setValueAtTime(650, now);
    this.sirenGain.gain.setValueAtTime(0.18, now);

    this.sirenOsc.connect(this.sirenGain);
    this.sirenGain.connect(this.masterGain);
    this.sirenOsc.start(now);

    let high = false;
    this.sirenInterval = setInterval(() => {
      if (!this.sirenOsc || !this.ctx) return;
      high = !high;
      const t = this.ctx.currentTime;
      this.sirenOsc.frequency.exponentialRampToValueAtTime(high ? 950 : 620, t + 0.4);
    }, 450);
  }

  // --- In-Game Procedural Radio ---
  public toggleRadio(): boolean {
    if (this.isRadioPlaying) {
      this.stopRadio();
      return false;
    } else {
      this.startRadio();
      return true;
    }
  }

  public nextStation(): number {
    this.currentStationIndex = (this.currentStationIndex + 1) % this.stations.length;
    if (this.isRadioPlaying) {
      this.startRadio();
    }
    return this.currentStationIndex;
  }

  public getCurrentStation() {
    return this.stations[this.currentStationIndex];
  }

  public isRadioOn(): boolean {
    return this.isRadioPlaying;
  }

  public startRadio() {
    this.init();
    if (!this.ctx || !this.radioGain) return;
    this.stopRadio();

    this.isRadioPlaying = true;
    let step = 0;

    const synthNotes = [220, 261.63, 329.63, 392.0, 440, 523.25];
    const loFiNotes = [196, 220, 246.94, 293.66, 329.63, 392];
    const technoNotes = [110, 130.81, 146.83, 164.81, 220];
    const darkNotes = [146.83, 174.61, 220, 261.63, 293.66];

    const notePools = [synthNotes, loFiNotes, darkNotes, technoNotes];

    this.radioTimer = setInterval(() => {
      if (!this.ctx || !this.radioGain || this.isMuted || !this.isRadioPlaying) return;

      const pool = notePools[this.currentStationIndex] || synthNotes;
      const freq = pool[Math.floor(Math.random() * pool.length)];

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.currentStationIndex === 0 ? 'sawtooth' : this.currentStationIndex === 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq * 0.5, now);
        bassGain.gain.setValueAtTime(0.25, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        bassOsc.connect(bassGain);
        bassGain.connect(this.radioGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.3);
      }

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);

      osc.connect(gain);
      gain.connect(this.radioGain);
      osc.start(now);
      osc.stop(now + 0.4);

      step = (step + 1) % 8;
    }, 280);
  }

  public stopRadio() {
    this.isRadioPlaying = false;
    if (this.radioTimer) {
      clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
