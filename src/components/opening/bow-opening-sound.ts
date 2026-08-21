/** Bow unwrap shimmer — first 4s of Desktop “bow opening sound.mp4”, tap-only, no loop. */

import { getInviteAudioContext, resumeInviteAudioContext } from "./invite-audio-context";

export const BOW_OPENING_SOUND = "/audio/bow-opening-1.mp3?v=bow-open-20260821b";

const TARGET_GAIN = 3;
/** Skip the first second of the 4s extract so tap lines up with the open. */
const CLIP_START_SEC = 1;
const CLIP_DURATION_SEC = 3;
const FADE_IN_SEC = 0.12;
/** Longer window so the end eases away instead of cutting. */
const FADE_OUT_DUR_SEC = 1.7;
const MIN_GAIN = 0.0001;
const FADE_CURVE_POINTS = 128;
/** Ease-out power: gentle early, nearly silent for the final stretch. */
const FADE_OUT_POWER = 2.8;
/** Low-shelf cut during fade so bass doesn't linger under the volume ramp. */
const BASS_SHELF_FREQ_HZ = 240;
const BASS_SHELF_CUT_DB = -36;

let decodedBuffer: AudioBuffer | null = null;
let decodePromise: Promise<AudioBuffer> | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeGain: GainNode | null = null;
let activeBassShelf: BiquadFilterNode | null = null;
let pendingStart = false;

function getContext(): AudioContext {
  return getInviteAudioContext();
}

function loadBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (decodedBuffer) return Promise.resolve(decodedBuffer);
  if (!decodePromise) {
    decodePromise = fetch(BOW_OPENING_SOUND)
      .then((res) => {
        if (!res.ok) throw new Error("bow opening sound failed to load");
        return res.arrayBuffer();
      })
      .then((data) => ctx.decodeAudioData(data.slice(0)))
      .then((buffer) => {
        decodedBuffer = buffer;
        return buffer;
      })
      .catch((err) => {
        decodePromise = null;
        throw err;
      });
  }
  return decodePromise;
}

function fadeOutCurve(): Float32Array {
  const curve = new Float32Array(FADE_CURVE_POINTS);
  for (let i = 0; i < FADE_CURVE_POINTS; i += 1) {
    const progress = i / (FADE_CURVE_POINTS - 1);
    // Smooth ease, then force near-silence in the final third so stop is inaudible
    let level = Math.pow(1 - progress, FADE_OUT_POWER);
    if (progress > 0.55) {
      const tail = (progress - 0.55) / 0.45;
      level *= Math.pow(1 - tail, 2.2);
    }
    curve[i] = TARGET_GAIN * level;
  }
  curve[FADE_CURVE_POINTS - 1] = 0;
  return curve;
}

function disconnectGraph(
  source: AudioBufferSourceNode | null,
  gain: GainNode | null,
  bassShelf: BiquadFilterNode | null
) {
  try {
    source?.disconnect();
  } catch {
    // already disconnected
  }
  try {
    bassShelf?.disconnect();
  } catch {
    // already disconnected
  }
  try {
    gain?.disconnect();
  } catch {
    // already disconnected
  }
}

function stopSourceImmediate() {
  pendingStart = false;
  const source = activeSource;
  const gain = activeGain;
  const bassShelf = activeBassShelf;
  activeSource = null;
  activeGain = null;
  activeBassShelf = null;
  if (!source) {
    disconnectGraph(source, gain, bassShelf);
    return;
  }

  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    if (gain) {
      const current = Math.max(MIN_GAIN, gain.gain.value || MIN_GAIN);
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(current, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.35);
      source.stop(now + 0.4);
    } else {
      source.stop();
    }
  } catch {
    // already stopped
  }
}

function playBuffer(buffer: AudioBuffer) {
  const audioCtx = getContext();

  stopSourceImmediate();
  pendingStart = false;

  const bassShelf = audioCtx.createBiquadFilter();
  bassShelf.type = "lowshelf";
  bassShelf.frequency.value = BASS_SHELF_FREQ_HZ;
  bassShelf.gain.value = 0;

  const gain = audioCtx.createGain();
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = false;
  source.connect(bassShelf);
  bassShelf.connect(gain);
  gain.connect(audioCtx.destination);

  const t0 = audioCtx.currentTime;
  const offset = Math.min(CLIP_START_SEC, Math.max(0, buffer.duration - 0.05));
  const playDur = Math.min(CLIP_DURATION_SEC, Math.max(0.05, buffer.duration - offset));
  const fadeOutStart = Math.max(FADE_IN_SEC + 0.05, playDur - FADE_OUT_DUR_SEC);
  const fadeOutDur = Math.max(0.2, playDur - fadeOutStart);

  gain.gain.cancelScheduledValues(t0);
  gain.gain.setValueAtTime(MIN_GAIN, t0);
  gain.gain.linearRampToValueAtTime(TARGET_GAIN, t0 + FADE_IN_SEC);
  gain.gain.setValueAtTime(TARGET_GAIN, t0 + fadeOutStart);
  gain.gain.setValueCurveAtTime(fadeOutCurve(), t0 + fadeOutStart, fadeOutDur);
  gain.gain.setValueAtTime(0, t0 + playDur);

  // Duck bass over the fade — cut arrives early so low end is gone before silence
  bassShelf.gain.cancelScheduledValues(t0);
  bassShelf.gain.setValueAtTime(0, t0);
  bassShelf.gain.setValueAtTime(0, t0 + fadeOutStart);
  bassShelf.gain.linearRampToValueAtTime(BASS_SHELF_CUT_DB * 0.7, t0 + fadeOutStart + fadeOutDur * 0.45);
  bassShelf.gain.linearRampToValueAtTime(BASS_SHELF_CUT_DB, t0 + playDur);

  source.onended = () => {
    if (activeSource === source) {
      activeSource = null;
      activeGain = null;
      activeBassShelf = null;
    }
    disconnectGraph(source, gain, bassShelf);
  };

  activeSource = source;
  activeGain = gain;
  activeBassShelf = bassShelf;
  source.start(t0, offset, playDur);
}

/** Warm decode so the bow tap can start instantly. */
export function preloadBowOpeningSound() {
  if (typeof window === "undefined") return;
  try {
    void loadBuffer(getContext());
  } catch {
    // ignore
  }
}

/**
 * Start on the bow tap (same user gesture — required on iPhone).
 * Plays ~1s→4s; ~1.7s fade with a quiet tail so the stop isn’t abrupt.
 */
export function startBowOpeningSound() {
  if (typeof window === "undefined") return;

  const ctx = getContext();
  pendingStart = true;
  void resumeInviteAudioContext();

  if (decodedBuffer) {
    pendingStart = false;
    playBuffer(decodedBuffer);
    return;
  }

  void loadBuffer(ctx)
    .then((buffer) => {
      if (!pendingStart) return;
      pendingStart = false;
      void resumeInviteAudioContext().then(() => {
        playBuffer(buffer);
      });
    })
    .catch(() => {
      pendingStart = false;
    });
}

export function stopBowOpeningSound() {
  stopSourceImmediate();
}
