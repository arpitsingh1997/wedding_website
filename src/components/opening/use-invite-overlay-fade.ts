"use client";

import { useEffect, useState } from "react";
import { PAGE_FADE_IN_MS } from "./invite-nav-motion";

/**
 * Keep an overlay mounted through opacity fades (invitation page-turn feel).
 * `open` mounts/unmounts; `revealed` drives the fade-in when provided.
 */
export function useInviteOverlayFade(open: boolean, revealed = true) {
  const [keepMounted, setKeepMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const t = window.setTimeout(() => setKeepMounted(false), PAGE_FADE_IN_MS);
      return () => window.clearTimeout(t);
    }

    setKeepMounted(true);
    if (!revealed) {
      setVisible(false);
      return;
    }

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, revealed]);

  // `open` must mount immediately (same frame as the nav gesture) so iPhone
  // can start muted video playback inside the user-gesture window.
  const rendered = open || keepMounted;

  return {
    rendered,
    fadeStyle: {
      opacity: visible ? 1 : 0,
      transition: `opacity ${PAGE_FADE_IN_MS}ms ease`,
      // Stay click-through until fade-in so nav pointerup can finish
      // (otherwise the invisible overlay steals the gesture).
      pointerEvents: visible ? "auto" : "none",
    } as const,
  };
}
