"use client";

import { useLayoutEffect } from "react";
import { DESKTOP_MIN_WIDTH } from "@/lib/viewport";

/**
 * Marks <html> with is-desktop / is-phone before paint so CSS art layers
 * (desklanding2 / desklanding3) win even if a media query is flaky.
 */
export function ViewportModeSync() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);

    const sync = () => {
      const desktop = media.matches;
      root.classList.toggle("is-desktop", desktop);
      root.classList.toggle("is-phone", !desktop);
      root.dataset.viewport = desktop ? "desktop" : "phone";
    };

    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      root.classList.remove("is-desktop", "is-phone");
      delete root.dataset.viewport;
    };
  }, []);

  return null;
}
