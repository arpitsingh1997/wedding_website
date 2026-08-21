/** Shared helpers for muted looping overlay videos (invite bells). */

import { kickSaveTheDateAudio } from "./save-the-date-audio";

export function armMutedLoopVideo(el: HTMLVideoElement) {
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.loop = true;
  el.setAttribute("muted", "");
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.controls = false;
}

export function playMutedLoopVideo(el: HTMLVideoElement | null) {
  if (!el) return;
  armMutedLoopVideo(el);
  if (el.paused) void el.play().catch(() => {});
}

/** Unlock muted invite-loop autoplay after the bow tap (phone + desktop). */
export function kickInviteVideoPlayback() {
  document
    .querySelectorAll('video[data-page="landing2-video"]')
    .forEach((node) => playMutedLoopVideo(node as HTMLVideoElement));
}

/** Start Celebrating Together bells (call from the nav tap — iPhone gesture). */
export function kickCelebratingBellsPlayback() {
  document
    .querySelectorAll('video[data-page="celebrating-together-bells"]')
    .forEach((node) => playMutedLoopVideo(node as HTMLVideoElement));
}

/**
 * Start Save the Date inside the nav tap gesture (iPhone).
 * Video stays muted; soundtrack is Web Audio (volume-controllable).
 */
export function kickSaveTheDatePlayback() {
  const el = document.querySelector(
    'video[data-video="save-the-date"]'
  ) as HTMLVideoElement | null;

  if (el) {
    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    el.playsInline = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.controls = false;
    void el.play().catch(() => {});
  }

  // Soundtrack via Web Audio (same tap gesture — required on iPhone)
  kickSaveTheDateAudio();
}
