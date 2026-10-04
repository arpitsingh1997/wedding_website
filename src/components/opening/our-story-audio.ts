/** Soft background clip for Our Story. */

import { createLoopingClip } from "./looping-clip-audio";

/**
 * ~2 dB under the bells / events music (≈ -24.5 LUFS) because vocals sit more
 * forward than instrumentals at equal loudness (raw clip ≈ -16.3 LUFS).
 */
export const OUR_STORY_AUDIO_VOLUME = 0.31;
export const OUR_STORY_AUDIO = "/media/youre-in-love-clip.m4a?v=story-buf-20260821c";

const ourStoryClip = createLoopingClip({
  src: OUR_STORY_AUDIO,
  volume: OUR_STORY_AUDIO_VOLUME,
});

export const preloadOurStoryAudio = ourStoryClip.preload;
export const kickOurStoryAudio = ourStoryClip.kick;
export const stopOurStoryAudio = ourStoryClip.stop;
