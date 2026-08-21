/** Soft background clip for Our Story — AudioBuffer + GainNode (works on iPhone). */

import { getInviteAudioContext, resumeInviteAudioContext } from "./invite-audio-context";

export const OUR_STORY_AUDIO_VOLUME = 0.2;
export const OUR_STORY_AUDIO = "/media/youre-in-love-clip.m4a?v=story-buf-20260821c";

let decodedBuffer: AudioBuffer | null = null;
let decodePromise: Promise<AudioBuffer> | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeGain: GainNode | null = null;
let storySessionActive = false;
let pausedForBackground = false;
let resumeAtSec = 0;
let startedAtCtxTime = 0;
let offsetWhenStarted = 0;
let lifecycleAttached = false;

function loadBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (decodedBuffer) return Promise.resolve(decodedBuffer);
  if (!decodePromise) {
    decodePromise = fetch(OUR_STORY_AUDIO)
      .then((res) => {
        if (!res.ok) throw new Error("our story audio failed to load");
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

function disconnectGraph(source: AudioBufferSourceNode | null, gain: GainNode | null) {
  try {
    source?.disconnect();
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
  const source = activeSource;
  const gain = activeGain;
  activeSource = null;
  activeGain = null;
  if (!source) {
    disconnectGraph(source, gain);
    return;
  }
  try {
    source.onended = null;
    source.stop();
  } catch {
    // already stopped
  }
  disconnectGraph(source, gain);
}

function currentPlaybackOffset(): number {
  const ctx = getInviteAudioContext();
  if (!decodedBuffer || !activeSource) return resumeAtSec;
  const elapsed = Math.max(0, ctx.currentTime - startedAtCtxTime);
  return (offsetWhenStarted + elapsed) % decodedBuffer.duration;
}

function playBuffer(buffer: AudioBuffer, offsetSec = 0) {
  if (!storySessionActive) return;

  const ctx = getInviteAudioContext();
  stopSourceImmediate();

  const gain = ctx.createGain();
  gain.gain.value = OUR_STORY_AUDIO_VOLUME;
  gain.connect(ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);

  const safeOffset = Math.max(0, Math.min(offsetSec, Math.max(0, buffer.duration - 0.05)));
  startedAtCtxTime = ctx.currentTime;
  offsetWhenStarted = safeOffset;

  source.onended = () => {
    if (activeSource === source) {
      activeSource = null;
      activeGain = null;
    }
    disconnectGraph(source, gain);
  };

  activeSource = source;
  activeGain = gain;
  source.start(0, safeOffset);
}

function pauseForBackground() {
  if (!storySessionActive || !activeSource) return;
  resumeAtSec = currentPlaybackOffset();
  pausedForBackground = true;
  stopSourceImmediate();
}

function resumeFromBackground() {
  if (!storySessionActive || !pausedForBackground) return;
  if (typeof document !== "undefined" && document.visibilityState !== "visible") {
    return;
  }
  pausedForBackground = false;
  void resumeInviteAudioContext().then(() => {
    if (!decodedBuffer || !storySessionActive) return;
    playBuffer(decodedBuffer, resumeAtSec);
  });
}

function onLifecycleHide() {
  pauseForBackground();
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    pauseForBackground();
    return;
  }
  resumeFromBackground();
}

function attachLifecycleListeners() {
  if (typeof window === "undefined" || lifecycleAttached) return;
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onLifecycleHide);
  window.addEventListener("freeze", onLifecycleHide);
  lifecycleAttached = true;
}

/** Warm decode so the first Our Story tap plays instantly */
export function preloadOurStoryAudio() {
  if (typeof window === "undefined") return;
  attachLifecycleListeners();
  try {
    void loadBuffer(getInviteAudioContext());
  } catch {
    // ignore
  }
}

/** Call from the Our Story tap so iOS allows unmuted playback */
export function kickOurStoryAudio() {
  if (typeof window === "undefined") return;
  storySessionActive = true;
  pausedForBackground = false;
  resumeAtSec = 0;
  attachLifecycleListeners();

  void resumeInviteAudioContext();

  if (decodedBuffer) {
    playBuffer(decodedBuffer, 0);
    return;
  }

  const ctx = getInviteAudioContext();
  void loadBuffer(ctx)
    .then((buffer) => {
      if (!storySessionActive) return;
      void resumeInviteAudioContext().then(() => {
        playBuffer(buffer, 0);
      });
    })
    .catch(() => {
      // ignore decode errors
    });
}

/** Close Our Story — stop and do not resume on unlock */
export function stopOurStoryAudio() {
  storySessionActive = false;
  pausedForBackground = false;
  resumeAtSec = 0;
  stopSourceImmediate();
}
