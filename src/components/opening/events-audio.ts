/**
 * Wedding Events background clip — Chanakya 0:26–0:56 with 1s fades baked in,
 * so 0:27–0:55 plays at full level.
 */

import { createLoopingClip } from "./looping-clip-audio";

/** Matches the bow bells' perceived loudness (bells ≈ -24.5 LUFS, clip ≈ -14.8 LUFS). */
export const EVENTS_AUDIO_VOLUME = 0.33;
export const EVENTS_AUDIO = "/media/chanakya-events-clip.m4a?v=events-audio-20261004a";

const eventsClip = createLoopingClip({
  src: EVENTS_AUDIO,
  volume: EVENTS_AUDIO_VOLUME,
});

export const preloadEventsAudio = eventsClip.preload;
export const kickEventsAudio = eventsClip.kick;
export const stopEventsAudio = eventsClip.stop;
