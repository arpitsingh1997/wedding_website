/** Soft background clip for Our Story — pre-trimmed 2:21.5 → 3:15 (plays from t=0) */
export const OUR_STORY_AUDIO_VOLUME = 0.06;

/** Trimmed from Desktop “our story/You are in love.mp4” — no seek delay on tap */
export const OUR_STORY_AUDIO = "/media/youre-in-love-clip.m4a";

let sharedAudio: HTMLAudioElement | null = null;
let endListenerAttached = false;
let lifecycleAttached = false;
/** True while the Our Story overlay is open */
let storySessionActive = false;
/** Paused because the screen/tab hid — resume when visible again */
let pausedForBackground = false;
let resumeAtSec = 0;

function loopClipToStart() {
  if (!sharedAudio || !storySessionActive) return;
  sharedAudio.currentTime = 0;
  void sharedAudio.play().catch(() => {});
}

function onEnded() {
  if (!storySessionActive) return;
  loopClipToStart();
}

function onTimeUpdate() {
  if (!sharedAudio || !storySessionActive) return;
  // Near end — loop (covers browsers that don't fire `ended` reliably)
  const duration = sharedAudio.duration;
  if (Number.isFinite(duration) && duration > 0 && sharedAudio.currentTime >= duration - 0.08) {
    loopClipToStart();
  }
}

function pauseForBackground() {
  if (!storySessionActive || !sharedAudio) return;
  if (sharedAudio.paused && !pausedForBackground) return;
  resumeAtSec = sharedAudio.currentTime;
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
  audio.volume = OUR_STORY_AUDIO_VOLUME;
  audio.currentTime = Math.max(0, resumeAtSec);
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
    sharedAudio.addEventListener("ended", onEnded);
    endListenerAttached = true;
  }
  attachLifecycleListeners();
  return sharedAudio;
}

/** Warm decode so the first Our Story tap plays instantly */
export function preloadOurStoryAudio() {
  if (typeof window === "undefined") return;
  const audio = getOurStoryAudio();
  audio.preload = "auto";
  // Kick network + decode without audible playback
  try {
    audio.load();
  } catch {
    /* ignore */
  }
}

/** Call from the Our Story tap so iOS allows unmuted playback */
export function kickOurStoryAudio() {
  if (typeof window === "undefined") return;
  storySessionActive = true;
  pausedForBackground = false;
  resumeAtSec = 0;
  const audio = getOurStoryAudio();
  audio.volume = OUR_STORY_AUDIO_VOLUME;
  // Clip already starts at the soft section — no seek wait
  if (audio.currentTime > 0.05) {
    audio.currentTime = 0;
  }
  void audio.play().catch(() => {});
}

/** Close Our Story — stop and do not resume on unlock */
export function stopOurStoryAudio() {
  storySessionActive = false;
  pausedForBackground = false;
  resumeAtSec = 0;
  if (!sharedAudio) return;
  sharedAudio.pause();
  sharedAudio.currentTime = 0;
}
