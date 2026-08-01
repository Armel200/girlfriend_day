/* ============================================================
   AUDIO MANAGER — musique d'ambiance + effets sonores
   Tout est synthétisé en Web Audio API (aucun fichier audio).

   - Musique : nappes douces + arpèges + basse (progression
     Cmaj7 → Am7 → Fmaj7 → G) avec un léger écho céleste.
   - Effets : dé, pas, coffre, machine à écrire, pluie de cœurs.
   ============================================================ */

type ToneOpts = {
  freq: number;
  t: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  filter?: number;
  echo?: boolean;
  bus?: "music" | "sfx";
};

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Progression d'accords (MIDI) — romantique et douce */
const CHORDS = [
  [48, 52, 55, 59], // Cmaj7
  [45, 48, 52, 55], // Am7
  [41, 45, 48, 52], // Fmaj7
  [43, 47, 50, 54], // G
];

/** Pattern d'arpège sur les notes de l'accord (16e de soupir) */
const ARP = [0, 1, 2, 3, 2, 1, 3, 2];

/** Durée d'une double-croche (84 BPM) */
const SIXTEENTH = 60 / 84 / 4;

class AudioManager {
  private static _instance: AudioManager | null = null;
  static get i(): AudioManager {
    if (!this._instance) this._instance = new AudioManager();
    return this._instance;
  }

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private delay: DelayNode | null = null;
  private delaySend: GainNode | null = null;

  private timer: number | null = null;
  private nextTime = 0;
  private step16 = 0;

  musicOn = true;
  sfxOn = true;

  /** Crée (ou réveille) le contexte audio — à appeler après un geste utilisateur */
  async ensure(): Promise<void> {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicOn ? 0.5 : 0;
      this.musicBus.connect(this.master);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxOn ? 0.9 : 0;
      this.sfxBus.connect(this.master);

      // Écho céleste (delay + feedback)
      this.delay = this.ctx.createDelay(1);
      this.delay.delayTime.value = 0.42;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.32;
      this.delaySend = this.ctx.createGain();
      this.delaySend.gain.value = 0.35;
      this.delaySend.connect(this.delay);
      this.delay.connect(feedback);
      feedback.connect(this.delay);
      this.delay.connect(this.master);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  /* ---------------- Musique ---------------- */

  setMusic(on: boolean): void {
    this.musicOn = on;
    if (this.ctx && this.musicBus) {
      this.musicBus.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.2);
    }
    if (on) this.startMusic();
    else this.stopMusic();
  }

  setSfx(on: boolean): void {
    this.sfxOn = on;
    if (this.ctx && this.sfxBus) {
      this.sfxBus.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05);
    }
  }

  private startMusic(): void {
    if (!this.ctx || this.timer !== null) return;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.step16 = 0;
    this.timer = window.setInterval(() => this.schedulerTick(), 40);
  }

  private stopMusic(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Regard en avant : programme les notes à l'avance */
  private schedulerTick(): void {
    if (!this.ctx) return;
    while (this.nextTime < this.ctx.currentTime + 0.3) {
      this.scheduleStep(this.step16, this.nextTime);
      this.nextTime += SIXTEENTH;
      this.step16 = (this.step16 + 1) % 64; // boucle de 4 mesures
    }
  }

  private scheduleStep(step: number, t: number): void {
    const bar = Math.floor(step / 16) % 4; // accord courant
    const pos = step % 16;
    const chord = CHORDS[bar];

    // Nappe au début de chaque mesure
    if (pos === 0) this.pad(chord, t);
    // Basse sur les temps 1 et 3
    if (pos === 0 || pos === 8) this.bass(chord[0] - 12, t);
    // Arpège toutes les doubles-croches
    const arpIdx = ARP[Math.floor(pos / 2)];
    this.arp(chord[arpIdx] + 12, t);
    // Éclat cristallin occasionnel
    if (pos === 12 && bar % 2 === 1) this.sparkle(chord[2] + 24, t);
  }

  private pad(chord: number[], t: number): void {
    chord.forEach((m) => this.tone({ freq: midiToFreq(m), t, dur: 3.4, type: "triangle", gain: 0.04, attack: 1.5, filter: 1500, bus: "music" }));
  }

  private bass(m: number, t: number): void {
    this.tone({ freq: midiToFreq(m), t, dur: 1.4, type: "sine", gain: 0.16, attack: 0.02, bus: "music" });
  }

  private arp(m: number, t: number): void {
    this.tone({ freq: midiToFreq(m), t, dur: 0.65, type: "triangle", gain: 0.09, attack: 0.01, echo: true, bus: "music" });
  }

  private sparkle(m: number, t: number): void {
    this.tone({ freq: midiToFreq(m), t, dur: 1.6, type: "sine", gain: 0.05, attack: 0.5, echo: true, bus: "music" });
  }

  /** Génère une note avec enveloppe, filtre et écho optionnels */
  private tone(opts: ToneOpts): void {
    if (!this.ctx) return;
    const bus = opts.bus === "sfx" ? this.sfxBus : this.musicBus;
    if (!bus) return;
    const { freq, t, dur, type = "sine", gain = 0.1, attack = 0.02, filter, echo } = opts;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = filter;
      osc.connect(f);
      f.connect(g);
    } else {
      osc.connect(g);
    }
    if (echo && this.delaySend) g.connect(this.delaySend);
    g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  /* ---------------- Effets sonores ---------------- */

  /** Dé qui roule : bruit + petits clics aléatoires */
  playRoll(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    // Bruit blanc filtré (frottement du dé)
    const len = 0.55;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * len), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1900;
    bp.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
    // Clics irréguliers
    for (let i = 0; i < 7; i++) {
      const tt = t + 0.08 + i * (0.07 + Math.random() * 0.06);
      this.click(150 + Math.random() * 900, tt, 0.05);
    }
  }

  /** Petit pas lumineux sur le plateau */
  playStep(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.tone({ freq: 330, t, dur: 0.16, type: "sine", gain: 0.12, attack: 0.005, bus: "sfx" });
    this.tone({ freq: 520, t: t + 0.07, dur: 0.14, type: "sine", gain: 0.08, attack: 0.005, bus: "sfx" });
  }

  /** Ouverture du coffre : arpège ascendant lumineux */
  playChest(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const notes = [72, 76, 79, 84, 88];
    notes.forEach((m, i) =>
      this.tone({ freq: midiToFreq(m), t: t + i * 0.09, dur: 1.2, type: "sine", gain: 0.14, attack: 0.01, echo: true, bus: "sfx" })
    );
  }

  /** Tic de machine à écrire */
  playType(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const len = 0.025;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * len), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2800;
    const g = this.ctx.createGain();
    g.gain.value = 0.09;
    src.connect(hp);
    hp.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
  }

  /** Claquement sec (utilisé par le dé) */
  private click(freq: number, t: number, dur: number): void {
    if (!this.ctx || !this.sfxBus) return;
    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Carillon d'introduction (logo) */
  playChime(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    this.tone({ freq: midiToFreq(76), t, dur: 2.2, type: "sine", gain: 0.12, attack: 0.01, echo: true, bus: "sfx" });
    this.tone({ freq: midiToFreq(83), t: t + 0.12, dur: 2.6, type: "sine", gain: 0.08, attack: 0.01, echo: true, bus: "sfx" });
  }

  /** Succès — grande finale */
  playWin(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const notes = [60, 64, 67, 71, 76, 79];
    notes.forEach((m, i) =>
      this.tone({ freq: midiToFreq(m), t: t + i * 0.11, dur: 3.4, type: "triangle", gain: 0.12, attack: 0.02, echo: true, bus: "sfx" })
    );
  }

  /** Quiétude pour la pluie de cœurs */
  playHearts(): void {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 1.4);
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(500, t);
    f.frequency.exponentialRampToValueAtTime(1800, t + 1.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    osc.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 1.9);
  }
}

/** Export singleton pour un usage global */
export const Audio = AudioManager.i;
