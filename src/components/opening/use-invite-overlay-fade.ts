"use client";

import { useEffect, useState } from "react";
import { PAGE_FADE_IN_MS } from "./invite-nav-motion";

/**
 * Keep an overlay mounted through opacity fades (invitation page-turn feel).
 * `open` mounts/unmounts; `revealed` drives the fade-in when provided.
 */
export function useInviteOverlayFade(open: boolean, revealed = true) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const t = window.setTimeout(() => setRendered(false), PAGE_FADE_IN_MS);
      return () => window.clearTimeout(t);
    }

    setRendered(true);
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

  return {
    rendered,
    fadeStyle: {
      opacity: visible ? 1 : 0,
      transition: `opacity ${PAGE_FADE_IN_MS}ms ease`,
    } as const,
  };
}
