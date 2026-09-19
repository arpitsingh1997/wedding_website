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
