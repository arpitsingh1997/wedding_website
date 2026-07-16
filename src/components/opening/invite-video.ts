/** Call from the bow tap (same user gesture) so iOS allows muted autoplay. */
export function kickInviteVideoPlayback() {
  const video = document.querySelector<HTMLVideoElement>(
    'video[data-page="landing2-video"]'
  );
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;
  video.controls = false;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  void video.play().catch(() => {});
}
