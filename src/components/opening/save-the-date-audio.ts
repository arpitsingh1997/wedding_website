/** Save the Date soundtrack — AudioBuffer + GainNode (video stays muted). */

import { getInviteAudioContext, resumeInviteAudioContext } from "./invite-audio-context";

export const SAVE_THE_DATE_AUDIO = "/media/save-the-date-audio.m4a?v=std-audio-20260821a";
export const SAVE_THE_DATE_AUDIO_VOLUME = 0.2;

let decodedBuffer: AudioBuffer | null = null;
let decodePromise: Promise<AudioBuffer> | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeGain: GainNode | null = null;
let sessionActive = false;

function loadBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (decodedBuffer) return Promise.resolve(decodedBuffer);
  if (!decodePromise) {
    decodePromise = fetch(SAVE_THE_DATE_AUDIO)
      .then((res) => {
        if (!res.ok) throw new Error("save the date audio failed to load");
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

function playBuffer(buffer: AudioBuffer) {
  if (!sessionActive) return;

  const ctx = getInviteAudioContext();
  stopSourceImmediate();

  const gain = ctx.createGain();
  gain.gain.value = SAVE_THE_DATE_AUDIO_VOLUME;
  gain.connect(ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = false;
  source.connect(gain);

  source.onended = () => {
    if (activeSource === source) {
      activeSource = null;
      activeGain = null;
    }
    disconnectGraph(source, gain);
  };

  activeSource = source;
  activeGain = gain;
  source.start(0);
}

/** Warm decode so the Save the Date tap can start instantly. */
export function preloadSaveTheDateAudio() {
  if (typeof window === "undefined") return;
  try {
    void loadBuffer(getInviteAudioContext());
  } catch {
    // ignore
  }
}

/** Start from the nav tap (same gesture as muted video play). */
export function kickSaveTheDateAudio() {
  if (typeof window === "undefined") return;
  sessionActive = true;
  void resumeInviteAudioContext();

  if (decodedBuffer) {
    playBuffer(decodedBuffer);
    return;
  }

  const ctx = getInviteAudioContext();
  void loadBuffer(ctx)
    .then((buffer) => {
      if (!sessionActive) return;
      void resumeInviteAudioContext().then(() => {
        playBuffer(buffer);
      });
    })
    .catch(() => {
      // ignore
    });
}

export function stopSaveTheDateAudio() {
  sessionActive = false;
  stopSourceImmediate();
}
