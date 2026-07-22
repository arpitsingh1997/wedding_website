/**
 * Bow unveil — two overlapping held piano notes.
 *
 *   0.00  G4 (hold)
 *   0.45  D5 (hold)
 * Both overlap; G4 keeps ringing under D5.
 */

export const BOW_CHIME_VERSION = "piano-g4-d5-overlap-v1";

const MASTER_VOLUME = 0.042;

const G4_START = 0;
const D5_START = 0.45;
const G4_HOLD_SEC = 2.0;
const D5_HOLD_SEC = 1.8;
const SEQUENCE_END_SEC = Math.max(G4_START + G4_HOLD_SEC, D5_START + D5_HOLD_SEC) + 0.2;

/** Equal-temperament Hz (A4 = 440) */
const G4_HZ = 392.0;
const D5_HZ = 587.33;

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
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.45));
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

function createHallImpulse(ctx: AudioContext, seconds = 2.0): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.ceil(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      const env = Math.exp(-t * 2.0) * (1 - t / seconds);
      const early = t < 0.06 ? Math.exp(-t * 34) * 0.32 : 0;
      let sample =
        (Math.random() * 2 - 1) * env * 0.46 +
        (Math.random() * 2 - 1) * early * 0.22;
      if (ch === 1) sample *= 0.94 + Math.sin(i * 0.0015) * 0.03;
      data[i] = sample;
    }
  }
  return buf;
}

/** Soft felt-piano note with long hold */
function playHeldPianoNote(
  ctx: AudioContext,
  dryDest: AudioNode,
  wetDest: AudioNode,
  t0: number,
  freq: number,
  velocity: number,
  holdSec: number
) {
  const fadeIn = 0.02;
  const fadeOut = 0.65;
  const end = t0 + holdSec;

  noiseBurst(ctx, dryDest, t0, {
    duration: 0.032,
    gain: 0.048 * velocity,
    filterType: "lowpass",
    frequency: Math.min(freq * 3.0, 2600),
    Q: 0.9,
    attack: 0.002,
  });

  const partials: { ratio: number; gain: number }[] = [
    { ratio: 1, gain: 0.78 * velocity },
    { ratio: 2.01, gain: 0.26 * velocity },
    { ratio: 3.02, gain: 0.09 * velocity },
    { ratio: 4.04, gain: 0.03 * velocity },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sine";
    const f = freq * p.ratio * (1 + (Math.random() - 0.5) * 0.001);
    osc.frequency.setValueAtTime(f, t0);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3600, t0);
    filter.frequency.exponentialRampToValueAtTime(1500, end);

    const peak = Math.max(p.gain, 0.0002);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(peak, t0 + fadeIn);
    amp.gain.setValueAtTime(peak, Math.max(t0 + fadeIn, end - fadeOut));
    amp.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(dryDest);
    amp.connect(wetDest);
    osc.start(t0);
    osc.stop(end + 0.08);
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
  dry.gain.value = 0.88;
  dry.connect(masterGain);

  const convolver = ctx.createConvolver();
  convolver.buffer = createHallImpulse(ctx, 2.0);
  const wet = ctx.createGain();
  wet.gain.setValueAtTime(0.0001, now);
  wet.gain.exponentialRampToValueAtTime(0.6, now + 0.1);
  wet.gain.exponentialRampToValueAtTime(0.45, now + 1.2);
  wet.gain.exponentialRampToValueAtTime(0.0001, now + SEQUENCE_END_SEC);

  const wetInput = ctx.createGain();
  wetInput.gain.value = 1;
  wetInput.connect(convolver);
  convolver.connect(wet);
  wet.connect(masterGain);

  // G4 starts and holds; D5 enters at 0.45s and overlaps
  playHeldPianoNote(ctx, dry, wetInput, now + G4_START, G4_HZ, 0.82, G4_HOLD_SEC);
  playHeldPianoNote(ctx, dry, wetInput, now + D5_START, D5_HZ, 0.88, D5_HOLD_SEC);

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
  const fade = force ? 0.06 : 0.4;
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
