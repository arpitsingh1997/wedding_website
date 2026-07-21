/** Shared helpers for muted looping overlay videos (invite + celebrating bells). */

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

/** Unlock muted invite-loop autoplay after the bow tap (iPhone). */
export function kickInviteVideoPlayback() {
  playMutedLoopVideo(
    document.querySelector(
      'video[data-page="landing2-video"]'
    ) as HTMLVideoElement | null
  );
}

/** Start Celebrating Together bells (call from the nav tap — iPhone gesture). */
export function kickCelebratingBellsPlayback() {
  playMutedLoopVideo(
    document.querySelector(
      'video[data-page="celebrating-together-bells"]'
    ) as HTMLVideoElement | null
  );
}
