/**
<<<<<<< HEAD
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
=======
 * Bow unveil soundscape (Web Audio):
 * 0.00s  soft satin ribbon loosening (very quiet)
 * 0.25s  delicate paper unfold
 * 0.60s  single crystal ting — G5
 * 0.65s  long airy reverb (~1s)
 * 1.10s  no new events (reverb tails into silence)
 */

const MASTER_VOLUME = 0.055;
/** Crystal ting pitch — G5 (A5 = 880 as alternate) */
const CRYSTAL_FREQ = 783.99;
const SEQUENCE_END_SEC = 1.85;
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)

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

<<<<<<< HEAD
=======
/** One-shot filtered noise burst */
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
function noiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  t0: number,
<<<<<<< HEAD
  opts: {
=======
  {
    duration,
    gain,
    filterType,
    frequency,
    Q,
    attack = 0.012,
  }: {
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
    duration: number;
    gain: number;
    filterType: BiquadFilterType;
    frequency: number;
    Q: number;
    attack?: number;
  }
) {
<<<<<<< HEAD
  const { duration, gain, filterType, frequency, Q, attack = 0.008 } = opts;
=======
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
  const frames = Math.max(1, Math.ceil(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
<<<<<<< HEAD
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.38));
=======
    const env = Math.exp(-i / (frames * 0.42));
    data[i] = (Math.random() * 2 - 1) * env;
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
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
<<<<<<< HEAD
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
=======
  src.stop(t0 + duration + 0.03);
}

/** Soft satin ribbon loosening — quiet low whoosh + silk texture */
function playSatinRibbon(ctx: AudioContext, dest: AudioNode, t0: number) {
  noiseBurst(ctx, dest, t0, {
    duration: 0.38,
    gain: 0.09,
    filterType: "lowpass",
    frequency: 420,
    Q: 0.55,
    attack: 0.06,
  });
  noiseBurst(ctx, dest, t0 + 0.04, {
    duration: 0.28,
    gain: 0.045,
    filterType: "bandpass",
    frequency: 900,
    Q: 0.8,
    attack: 0.05,
  });
}

/** Delicate paper unfold — light high rustle */
function playPaperUnfold(ctx: AudioContext, dest: AudioNode, t0: number) {
  noiseBurst(ctx, dest, t0, {
    duration: 0.22,
    gain: 0.11,
    filterType: "bandpass",
    frequency: 2800,
    Q: 1.1,
    attack: 0.008,
  });
  noiseBurst(ctx, dest, t0 + 0.05, {
    duration: 0.18,
    gain: 0.06,
    filterType: "highpass",
    frequency: 4200,
    Q: 0.7,
    attack: 0.01,
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
  });
}

/**
<<<<<<< HEAD
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
=======
 * Generated impulse — bright early reflections + long airy tail (~1s).
 */
function createAiryImpulse(ctx: AudioContext, seconds = 1.05): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.ceil(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      // Fast decay envelope for airy hall, not a slap echo
      const env = Math.exp(-t * 3.2) * (1 - t / seconds);
      const early = t < 0.045 ? Math.exp(-t * 55) * 0.55 : 0;
      data[i] =
        (Math.random() * 2 - 1) * env * 0.55 +
        (Math.random() * 2 - 1) * early * 0.35;
      // Slight stereo decorrelation
      if (ch === 1) data[i] *= 0.92 + Math.sin(i * 0.002) * 0.04;
    }
  }
  return buf;
}

/** Single crystal ting (G5) into long airy reverb */
function playCrystalTing(
  ctx: AudioContext,
  dryDest: AudioNode,
  wetDest: AudioNode,
  t0: number
) {
  const freq = CRYSTAL_FREQ;

  // Contact whisper
  noiseBurst(ctx, dryDest, t0, {
    duration: 0.03,
    gain: 0.08,
    filterType: "bandpass",
    frequency: freq * 1.4,
    Q: 1.2,
    attack: 0.003,
  });

  const partials: { ratio: number; gain: number; decay: number }[] = [
    { ratio: 1, gain: 0.85, decay: 1.15 },
    { ratio: 2.002, gain: 0.18, decay: 0.75 },
    { ratio: 2.76, gain: 0.07, decay: 0.55 },
    { ratio: 5.4, gain: 0.035, decay: 0.4 },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * p.ratio, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(p.gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + p.decay);
    osc.connect(amp);
    amp.connect(dryDest);
    amp.connect(wetDest);
    osc.start(t0);
    osc.stop(t0 + p.decay + 0.08);
  }
}

/**
 * Begin the unveil soundscape. Call from the bow tap (iOS gesture).
 */
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
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

<<<<<<< HEAD
  // Dry only — no long hall reverb (that made it sound like wind chimes)
  playLatch(ctx, masterGain, now + 0.0);
  playWoodBody(ctx, masterGain, now + 0.02);
  playVelvetLid(ctx, masterGain, now + 0.18);
  playGlassPing(ctx, masterGain, now + 0.48);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.bowChime = BOW_CHIME_VERSION;
  }

=======
  // Dry path
  const dry = ctx.createGain();
  dry.gain.value = 1;
  dry.connect(masterGain);

  // Wet / airy reverb path (fed mainly by the crystal)
  const convolver = ctx.createConvolver();
  convolver.buffer = createAiryImpulse(ctx, 1.05);
  const wet = ctx.createGain();
  wet.gain.value = 0.0001;
  // Reverb blooms just after the ting
  wet.gain.setValueAtTime(0.0001, now + 0.6);
  wet.gain.exponentialRampToValueAtTime(0.95, now + 0.65);
  wet.gain.exponentialRampToValueAtTime(0.55, now + 1.05);
  wet.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);

  const wetInput = ctx.createGain();
  wetInput.gain.value = 1;
  wetInput.connect(convolver);
  convolver.connect(wet);
  wet.connect(masterGain);

  // Timeline
  playSatinRibbon(ctx, dry, now + 0.0);
  playPaperUnfold(ctx, dry, now + 0.25);
  playCrystalTing(ctx, dry, wetInput, now + 0.6);

  // Self-end into silence (don't cut the reverb when the bow finishes ~1.1s)
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
  stopTimer = window.setTimeout(() => {
    stopTimer = null;
    stopBowChime(false);
  }, SEQUENCE_END_SEC * 1000);
}

<<<<<<< HEAD
=======
/**
 * Soft teardown. Pass `force` to cut immediately (new start / unmount).
 */
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
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
<<<<<<< HEAD
  const fade = force ? 0.05 : 0.22;
=======
  const fade = force ? 0.08 : 0.35;
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
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
<<<<<<< HEAD
  }, fade * 1000 + 50);
=======
  }, fade * 1000 + 80);
>>>>>>> a8bdb86 (Add 5-menu scroll, Celebrating Together, and related invite updates)
}
