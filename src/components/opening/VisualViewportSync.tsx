"use client";

import { useEffect } from "react";

/**
 * Width can track the screen; hero height must stay stable.
 * Updating height while Chrome/Safari hide their bars was resizing the invite
 * cover image and looked like a zoom on scroll.
 */
export function applyViewportVars(options?: { updateHeroHeight?: boolean }) {
  if (typeof window === "undefined") return;
  const vv = window.visualViewport;
  const width = Math.round(
    Math.max(window.innerWidth, vv?.width ?? 0, document.documentElement.clientWidth || 0)
  );
  const root = document.documentElement;
  root.style.setProperty("--app-width", `${width}px`);

  if (options?.updateHeroHeight) {
    // Prefer the smaller (chrome-visible) height so the hero doesn't grow later
    const height = Math.round(
      Math.min(
        window.innerHeight || Number.POSITIVE_INFINITY,
        vv?.height || Number.POSITIVE_INFINITY,
        document.documentElement.clientHeight || Number.POSITIVE_INFINITY
      )
    );
    if (Number.isFinite(height) && height > 0) {
      root.style.setProperty("--hero-height", `${height}px`);
      root.style.setProperty("--app-height", `${height}px`);
    }
  }
}

export function VisualViewportSync() {
  useEffect(() => {
    applyViewportVars({ updateHeroHeight: true });

    const onOrientation = () => {
      // orientation change is a real layout change — refresh hero height
      window.setTimeout(() => applyViewportVars({ updateHeroHeight: true }), 150);
    };
    const onResize = () => {
      // width-only; do not touch hero height (avoids zoom-on-scroll)
      applyViewportVars({ updateHeroHeight: false });
    };

    window.addEventListener("orientationchange", onOrientation);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("orientationchange", onOrientation);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
