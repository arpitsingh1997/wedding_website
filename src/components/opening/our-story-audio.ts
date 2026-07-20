/** Soft background clip for Our Story — 2:21.5 → 3:15 */
export const OUR_STORY_AUDIO_START_SEC = 2 * 60 + 21.5;
export const OUR_STORY_AUDIO_END_SEC = 3 * 60 + 15;
/** Quiet enough to sit under the story without competing */
export const OUR_STORY_AUDIO_VOLUME = 0.06;

/** From Desktop “our story/You are in love.mp4” (audio extracted) */
export const OUR_STORY_AUDIO = "/media/youre-in-love.m4a";

let sharedAudio: HTMLAudioElement | null = null;
let endListenerAttached = false;
let lifecycleAttached = false;
/** True while the Our Story overlay is open */
let storySessionActive = false;
/** Paused because the screen/tab hid — resume when visible again */
let pausedForBackground = false;
let resumeAtSec = OUR_STORY_AUDIO_START_SEC;

function loopClipToStart() {
  if (!sharedAudio || !storySessionActive) return;
  sharedAudio.currentTime = OUR_STORY_AUDIO_START_SEC;
  void sharedAudio.play().catch(() => {});
}

function onTimeUpdate() {
  if (!sharedAudio || !storySessionActive) return;
  // Keep looping the soft clip while Our Story stays open
  if (sharedAudio.currentTime >= OUR_STORY_AUDIO_END_SEC) {
    loopClipToStart();
  }
}

function pauseForBackground() {
  if (!storySessionActive || !sharedAudio) return;
  if (sharedAudio.paused && !pausedForBackground) return;
  resumeAtSec = sharedAudio.currentTime;
  if (resumeAtSec >= OUR_STORY_AUDIO_END_SEC) {
    resumeAtSec = OUR_STORY_AUDIO_START_SEC;
  }
  sharedAudio.pause();
  pausedForBackground = true;
}

function resumeFromBackground() {
  if (!storySessionActive || !pausedForBackground) return;
  if (typeof document !== "undefined" && document.visibilityState !== "visible") {
    return;
  }
  pausedForBackground = false;
  const audio = getOurStoryAudio();
  const t = Math.min(
    Math.max(resumeAtSec, OUR_STORY_AUDIO_START_SEC),
    OUR_STORY_AUDIO_END_SEC - 0.05
  );
  audio.volume = OUR_STORY_AUDIO_VOLUME;
  audio.currentTime = t;
  void audio.play().catch(() => {});
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

function getOurStoryAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio(OUR_STORY_AUDIO);
    sharedAudio.preload = "auto";
    sharedAudio.loop = false;
    sharedAudio.volume = OUR_STORY_AUDIO_VOLUME;
  }
  if (!endListenerAttached) {
    sharedAudio.addEventListener("timeupdate", onTimeUpdate);
    endListenerAttached = true;
  }
  attachLifecycleListeners();
  return sharedAudio;
}

/** Call from the Our Story tap so iOS allows unmuted playback */
export function kickOurStoryAudio() {
  if (typeof window === "undefined") return;
  storySessionActive = true;
  pausedForBackground = false;
  resumeAtSec = OUR_STORY_AUDIO_START_SEC;
  const audio = getOurStoryAudio();
  audio.volume = OUR_STORY_AUDIO_VOLUME;
  audio.currentTime = OUR_STORY_AUDIO_START_SEC;
  void audio.play().catch(() => {});
}

/** Close Our Story — stop and do not resume on unlock */
export function stopOurStoryAudio() {
  storySessionActive = false;
  pausedForBackground = false;
  resumeAtSec = OUR_STORY_AUDIO_START_SEC;
  if (!sharedAudio) return;
  sharedAudio.pause();
  sharedAudio.currentTime = OUR_STORY_AUDIO_START_SEC;
}
