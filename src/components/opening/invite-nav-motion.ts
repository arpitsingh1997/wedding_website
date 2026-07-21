/** Invitation-page nav motion — soft press, then gentle fade (no slide/zoom). */

export const PRESS_HOLD_MS = 135;
export const PAGE_FADE_OUT_MS = 220;
export const PAGE_FADE_IN_MS = 280;

export function waitMs(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
