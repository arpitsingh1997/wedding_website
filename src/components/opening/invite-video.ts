/** Shared helpers for muted looping overlay videos (invite bells). */

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
 * Start Save the Date with sound inside the nav tap gesture (iPhone).
 * Must run in the same turn as flushSync mount — play() after await is blocked.
 */
export function kickSaveTheDatePlayback() {
  const el = document.querySelector(
    'video[data-video="save-the-date"]'
  ) as HTMLVideoElement | null;
  if (!el) return;

  el.muted = false;
  el.defaultMuted = false;
  el.playsInline = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.controls = false;

  try {
    el.load();
  } catch {
    // ignore
  }

  void el.play().catch(() => {
    // Will retry from loadeddata / canplay while open
  });
}
