/**
 * Luxury jewelry-box unveil (Web Audio).
 *
 * Soft clasp → velvet hinge → single high crystal ping with short elegant air.
 * Quiet, intimate, expensive — not a wind chime, doorbell, or paper rustle.
 *
 * 0.00s  muted gold clasp release
 * 0.12s  velvet / wood hinge whisper
 * 0.42s  lid lifts (soft air)
 * 0.58s  single crystal ting (C6) + short bright reverb
 * ~1.3s  silence
 */

const MASTER_VOLUME = 0.038;
/** Crystal — C6 (gentle jewelry ping; sits above speech, not piercing) */
const CRYSTAL_FREQ = 1046.5;
const SEQUENCE_END_SEC = 1.45;

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
  {
    duration,
    gain,
    filterType,
    frequency,
    Q,
    attack = 0.01,
  }: {
    duration: number;
    gain: number;
    filterType: BiquadFilterType;
    frequency: number;
    Q: number;
    attack?: number;
  }
) {
  const frames = Math.max(1, Math.ceil(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.4));
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

/** Tiny muted clasp — gold latch letting go */
function playClasp(ctx: AudioContext, dest: AudioNode, t0: number) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(420, t0);
  osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.04);
  filter.type = "lowpass";
  filter.frequency.value = 900;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(0.35, t0 + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.055);
  osc.connect(filter);
  filter.connect(amp);
  amp.connect(dest);
  osc.start(t0);
  osc.stop(t0 + 0.07);

  // Soft felt pad under the click
  noiseBurst(ctx, dest, t0, {
    duration: 0.05,
    gain: 0.06,
    filterType: "lowpass",
    frequency: 380,
    Q: 0.6,
    attack: 0.003,
  });
}

/** Velvet-lined hinge — quiet low wood/silk glide */
function playVelvetHinge(ctx: AudioContext, dest: AudioNode, t0: number) {
  noiseBurst(ctx, dest, t0, {
    duration: 0.42,
    gain: 0.07,
    filterType: "lowpass",
    frequency: 280,
    Q: 0.45,
    attack: 0.08,
  });
  noiseBurst(ctx, dest, t0 + 0.06, {
    duration: 0.32,
    gain: 0.035,
    filterType: "bandpass",
    frequency: 640,
    Q: 0.7,
    attack: 0.07,
  });
}

/** Lid rising — soft air, almost breath */
function playLidLift(ctx: AudioContext, dest: AudioNode, t0: number) {
  noiseBurst(ctx, dest, t0, {
    duration: 0.28,
    gain: 0.055,
    filterType: "bandpass",
    frequency: 1200,
    Q: 0.55,
    attack: 0.05,
  });
}

/** Short bright jewelry-case air (not a large hall) */
function createJewelImpulse(ctx: AudioContext, seconds = 0.85): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.ceil(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / rate;
      const env = Math.exp(-t * 5.5) * (1 - t / seconds);
      const early = t < 0.02 ? Math.exp(-t * 90) * 0.4 : 0;
      data[i] =
        (Math.random() * 2 - 1) * env * 0.4 +
        (Math.random() * 2 - 1) * early * 0.25;
      if (ch === 1) data[i] *= 0.94;
    }
  }
  return buf;
}

/** Single clear crystal — one gem catching the light */
function playCrystalPing(
  ctx: AudioContext,
  dryDest: AudioNode,
  wetDest: AudioNode,
  t0: number
) {
  const freq = CRYSTAL_FREQ;

  noiseBurst(ctx, dryDest, t0, {
    duration: 0.018,
    gain: 0.05,
    filterType: "bandpass",
    frequency: freq * 1.5,
    Q: 1.4,
    attack: 0.002,
  });

  const partials = [
    { ratio: 1, gain: 0.7, decay: 0.85 },
    { ratio: 2.01, gain: 0.14, decay: 0.5 },
    { ratio: 3.0, gain: 0.04, decay: 0.32 },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * p.ratio, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(p.gain, t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + p.decay);
    osc.connect(amp);
    amp.connect(dryDest);
    amp.connect(wetDest);
    osc.start(t0);
    osc.stop(t0 + p.decay + 0.05);
  }
}

/** Begin on the bow tap (iOS requires the user gesture). */
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
  dry.gain.value = 1;
  dry.connect(masterGain);

  const convolver = ctx.createConvolver();
  convolver.buffer = createJewelImpulse(ctx, 0.85);
  const wet = ctx.createGain();
  wet.gain.value = 0.0001;
  wet.gain.setValueAtTime(0.0001, now + 0.55);
  wet.gain.exponentialRampToValueAtTime(0.7, now + 0.6);
  wet.gain.exponentialRampToValueAtTime(0.35, now + 0.95);
  wet.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);

  const wetInput = ctx.createGain();
  wetInput.gain.value = 1;
  wetInput.connect(convolver);
  convolver.connect(wet);
  wet.connect(masterGain);

  playClasp(ctx, dry, now + 0.0);
  playVelvetHinge(ctx, dry, now + 0.12);
  playLidLift(ctx, dry, now + 0.42);
  playCrystalPing(ctx, dry, wetInput, now + 0.58);

  stopTimer = window.setTimeout(() => {
    stopTimer = null;
    stopBowChime(false);
  }, SEQUENCE_END_SEC * 1000);
}

/** Soft teardown. `force` cuts immediately (retap / unmount). */
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
  const fade = force ? 0.06 : 0.28;
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
