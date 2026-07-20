/**
 * Luxury jewelry-box unveil — v2 (intentionally different from wind-chime).
 *
 * Soft latch click → wood/velvet lid → one short glass ping.
 * Dry and intimate (small box), not airy chimes or paper rustle.
 *
 * Signature: BUILD tag jewelry-box-v2 — if you still hear multi-note tubes,
 * the old bundle is cached; hard-refresh.
 */

export const BOW_CHIME_VERSION = "jewelry-box-v2";

const MASTER_VOLUME = 0.052;
/** Short glass ping — E6 (brighter / shorter than the old G5–A5 tubes) */
const GLASS_FREQ = 1318.5;
const SEQUENCE_END_SEC = 1.25;

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
  const { duration, gain, filterType, frequency, Q, attack = 0.008 } = opts;
  const frames = Math.max(1, Math.ceil(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.38));
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
  src.stop(t0 + duration + 0.02);
}

/** Gold clasp — quick muted tick (mechanical, not a bell) */
function playLatch(ctx: AudioContext, dest: AudioNode, t0: number) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "square";
  osc.frequency.setValueAtTime(980, t0);
  osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.03);
  filter.type = "bandpass";
  filter.frequency.value = 1100;
  filter.Q.value = 2.2;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.22, t0 + 0.002);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
  osc.connect(filter);
  filter.connect(amp);
  amp.connect(dest);
  osc.start(t0);
  osc.stop(t0 + 0.05);

  noiseBurst(ctx, dest, t0, {
    duration: 0.035,
    gain: 0.08,
    filterType: "highpass",
    frequency: 2400,
    Q: 0.8,
    attack: 0.001,
  });
}

/** Soft wood body — the box itself (low, short) */
function playWoodBody(ctx: AudioContext, dest: AudioNode, t0: number) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "sine";
  osc.frequency.setValueAtTime(95, t0);
  filter.type = "lowpass";
  filter.frequency.value = 220;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.45, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
  osc.connect(filter);
  filter.connect(amp);
  amp.connect(dest);
  osc.start(t0);
  osc.stop(t0 + 0.32);
}

/** Velvet lid glide */
function playVelvetLid(ctx: AudioContext, dest: AudioNode, t0: number) {
  noiseBurst(ctx, dest, t0, {
    duration: 0.35,
    gain: 0.09,
    filterType: "lowpass",
    frequency: 320,
    Q: 0.5,
    attack: 0.06,
  });
  noiseBurst(ctx, dest, t0 + 0.05, {
    duration: 0.22,
    gain: 0.04,
    filterType: "bandpass",
    frequency: 780,
    Q: 0.9,
    attack: 0.04,
  });
}

/**
 * One glass ping via light FM — reads as crystal in a box, not wind-chime tubes.
 */
function playGlassPing(ctx: AudioContext, dest: AudioNode, t0: number) {
  const carrier = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  carrier.type = "sine";
  mod.type = "sine";
  carrier.frequency.setValueAtTime(GLASS_FREQ, t0);
  mod.frequency.setValueAtTime(GLASS_FREQ * 2.01, t0);

  // Brief FM sparkle, then pure tone
  modGain.gain.setValueAtTime(90, t0);
  modGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4200, t0);
  filter.frequency.exponentialRampToValueAtTime(1800, t0 + 0.4);

  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.55, t0 + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);

  mod.connect(modGain);
  modGain.connect(carrier.frequency);
  carrier.connect(filter);
  filter.connect(amp);
  amp.connect(dest);

  carrier.start(t0);
  mod.start(t0);
  carrier.stop(t0 + 0.6);
  mod.stop(t0 + 0.6);

  // Quiet octave above — tiny gem glint only
  const glint = ctx.createOscillator();
  const glintAmp = ctx.createGain();
  glint.type = "sine";
  glint.frequency.setValueAtTime(GLASS_FREQ * 2, t0);
  glintAmp.gain.setValueAtTime(0.0001, t0);
  glintAmp.gain.exponentialRampToValueAtTime(0.08, t0 + 0.005);
  glintAmp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
  glint.connect(glintAmp);
  glintAmp.connect(dest);
  glint.start(t0);
  glint.stop(t0 + 0.25);
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

  // Dry only — no long hall reverb (that made it sound like wind chimes)
  playLatch(ctx, masterGain, now + 0.0);
  playWoodBody(ctx, masterGain, now + 0.02);
  playVelvetLid(ctx, masterGain, now + 0.18);
  playGlassPing(ctx, masterGain, now + 0.48);

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
  const fade = force ? 0.05 : 0.22;
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
  }, fade * 1000 + 50);
}
