/**
 * Bow unveil — soft celesta / music-box nod to “You Are My Sunshine.”
 *
 * First 3 notes only (not a recognizable tune):
 *   tonic → major 3rd → perfect 5th  (G–B–D triad)
 * Slow spacing (~300 ms), long airy reverb, quiet glass texture under.
 * Elegant & delicate — not whimsical or magical.
 */

export const BOW_CHIME_VERSION = "celesta-sunshine-v4";

const MASTER_VOLUME = 0.038;
/** Cue length including reverb tail */
const SEQUENCE_END_SEC = 1.2;

/**
 * Celesta register — soft, high, not piercing.
 * G5–B5–D6 — ascending major triad (sunshine interval shape).
 */
const MOTIF_HZ = [783.99, 987.77, 1174.66] as const;
/** Wide, unhurried spacing between note attacks */
const NOTE_GAP_SEC = 0.3;
const NOTE_STARTS = MOTIF_HZ.map((_, i) => i * NOTE_GAP_SEC);

let sharedCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let stopTimer: number | null = null;
let playing = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

function clearStopTimer() {
  if (stopTimer == null) return;
  window.clearTimeout(stopTimer);
  stopTimer = null;
}

/** Soft filtered noise for glass / air texture */
function noiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  t0: number,
  opts: {
    duration: number;
    gain: number;
    filterType: BiquadFilterType;
    frequency: number;
    Q: number;
    attack?: number;
  }
) {
  const { duration, gain, filterType, frequency, Q, attack = 0.02 } = opts;
  const frames = Math.max(1, Math.ceil(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.55));
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, t0);
  filter.Q.value = Q;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t0 + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  src.connect(filter);
  filter.connect(amp);
  amp.connect(dest);
  src.start(t0);
  src.stop(t0 + duration + 0.04);
}

/**
 * Long natural hall — bright early air, gentle decay (~1.1s).
 * Kept soft so it feels luxurious, not sparkly.
 */
function createHallImpulse(ctx: AudioContext, seconds = 1.1): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.ceil(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      const env = Math.exp(-t * 2.4) * (1 - t / seconds);
      const early = t < 0.05 ? Math.exp(-t * 40) * 0.4 : 0;
      let sample =
        (Math.random() * 2 - 1) * env * 0.5 +
        (Math.random() * 2 - 1) * early * 0.28;
      if (ch === 1) sample *= 0.93 + Math.sin(i * 0.0018) * 0.035;
      data[i] = sample;
    }
  }
  return buf;
}

/**
 * One celesta / music-box note — soft attack, pure body, faint high partial.
 * Mild inharmonicity keeps it from sounding like a toy MIDI patch.
 */
function playCelestaNote(
  ctx: AudioContext,
  dryDest: AudioNode,
  wetDest: AudioNode,
  t0: number,
  freq: number,
  velocity = 1
) {
  const partials: { ratio: number; gain: number; decay: number }[] = [
    { ratio: 1, gain: 0.72 * velocity, decay: 0.95 },
    { ratio: 2.003, gain: 0.22 * velocity, decay: 0.7 },
    { ratio: 2.76, gain: 0.045 * velocity, decay: 0.42 },
    { ratio: 5.43, gain: 0.018 * velocity, decay: 0.28 },
  ];

  // Soft hammer / mallet whisper
  noiseBurst(ctx, dryDest, t0, {
    duration: 0.028,
    gain: 0.045 * velocity,
    filterType: "bandpass",
    frequency: freq * 1.15,
    Q: 1.4,
    attack: 0.002,
  });

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sine";
    // Tiny detune drift — celesta, not a perfect synth sine
    const f = freq * p.ratio * (1 + (Math.random() - 0.5) * 0.0015);
    osc.frequency.setValueAtTime(f, t0);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(5200, t0);
    filter.frequency.exponentialRampToValueAtTime(2400, t0 + p.decay * 0.6);

    const peak = Math.max(p.gain, 0.0002);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + p.decay);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(dryDest);
    amp.connect(wetDest);
    osc.start(t0);
    osc.stop(t0 + p.decay + 0.06);
  }
}

/**
 * Very soft glass wind-chime bed — sparse high glass ticks + airy shimmer.
 * Stays under the motif; never a cascade or sparkle shower.
 */
function playGlassTexture(
  ctx: AudioContext,
  dryDest: AudioNode,
  wetDest: AudioNode,
  t0: number
) {
  // Continuous soft glass air
  noiseBurst(ctx, wetDest, t0, {
    duration: 1.05,
    gain: 0.028,
    filterType: "bandpass",
    frequency: 4200,
    Q: 0.55,
    attack: 0.12,
  });
  noiseBurst(ctx, dryDest, t0 + 0.08, {
    duration: 0.9,
    gain: 0.012,
    filterType: "highpass",
    frequency: 6000,
    Q: 0.6,
    attack: 0.18,
  });

  // Three sparse, quiet glass ticks (not a melody)
  const glassHz = [2093, 2637, 3136];
  const glassAt = [0.12, 0.48, 0.82];
  for (let i = 0; i < glassHz.length; i++) {
    const when = t0 + glassAt[i];
    const freq = glassHz[i];
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, when);
    amp.gain.setValueAtTime(0.0001, when);
    amp.gain.exponentialRampToValueAtTime(0.055, when + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
    osc.connect(amp);
    amp.connect(dryDest);
    amp.connect(wetDest);
    osc.start(when);
    osc.stop(when + 0.6);
  }
}

/** Begin on the bow tap (iOS gesture). */
export function startBowChime() {
  if (typeof window === "undefined") return;
  stopBowChime(true);

  const ctx = getAudioContext();
  if (!ctx) return;

  sharedCtx = ctx;
  playing = true;
  void ctx.resume().catch(() => {});

  const now = ctx.currentTime;

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(MASTER_VOLUME, now);
  masterGain.connect(ctx.destination);

  const dry = ctx.createGain();
  dry.gain.value = 0.85;
  dry.connect(masterGain);

  const convolver = ctx.createConvolver();
  convolver.buffer = createHallImpulse(ctx, 1.1);
  const wet = ctx.createGain();
  // Long natural bloom — present but restrained
  wet.gain.setValueAtTime(0.0001, now);
  wet.gain.exponentialRampToValueAtTime(0.7, now + 0.08);
  wet.gain.exponentialRampToValueAtTime(0.45, now + 0.7);
  wet.gain.exponentialRampToValueAtTime(0.0001, now + 1.18);

  const wetInput = ctx.createGain();
  wetInput.gain.value = 1;
  wetInput.connect(convolver);
  convolver.connect(wet);
  wet.connect(masterGain);

  playGlassTexture(ctx, dry, wetInput, now);

  // Motif: soft rise through the triad
  const velocities = [0.76, 0.82, 0.88];
  for (let i = 0; i < MOTIF_HZ.length; i++) {
    playCelestaNote(
      ctx,
      dry,
      wetInput,
      now + NOTE_STARTS[i],
      MOTIF_HZ[i],
      velocities[i]
    );
  }

  if (typeof document !== "undefined") {
    document.documentElement.dataset.bowChime = BOW_CHIME_VERSION;
  }

  stopTimer = window.setTimeout(() => {
    stopTimer = null;
    stopBowChime(false);
  }, SEQUENCE_END_SEC * 1000);
}

export function stopBowChime(force = false) {
  clearStopTimer();
  if (!playing && !sharedCtx) return;

  playing = false;
  const ctx = sharedCtx;
  const master = masterGain;
  sharedCtx = null;
  masterGain = null;

  if (!ctx || !master) return;

  const now = ctx.currentTime;
  const fade = force ? 0.06 : 0.32;
  try {
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + fade);
  } catch {
    // ignore
  }

  stopTimer = window.setTimeout(() => {
    stopTimer = null;
    void ctx.close().catch(() => {});
  }, fade * 1000 + 60);
}
