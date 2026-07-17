/** Unlock muted invite-loop autoplay after the bow tap (iPhone). */
export function kickInviteVideoPlayback() {
  const el = document.querySelector(
    'video[data-page="landing2-video"]'
  ) as HTMLVideoElement | null;
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.loop = true;
  void el.play().catch(() => {});
}
