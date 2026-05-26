export const DESKTOP_MIN_WIDTH = 1024;

export function isDesktopViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;
}
