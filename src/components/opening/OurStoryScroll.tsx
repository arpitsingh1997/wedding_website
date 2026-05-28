"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OurStoryDesktop } from "./our-story/OurStoryDesktop";
import { OurStoryPanelScroll } from "./our-story/OurStoryPanelScroll";

type OurStoryScrollProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Our Story — full-bleed scroll.
 * Phone: five PNG panels (1→5) seamless vertical scroll.
 * Mac: single desktop.png seamless scroll.
 */
export function OurStoryScroll({ open, onClose }: OurStoryScrollProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const panel = document.getElementById("our-story");
    panel?.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100020] select-none overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#FFFBF0]"
      style={{ width: "100vw", minHeight: "100dvh", WebkitOverflowScrolling: "touch", userSelect: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label="Our story"
      id="our-story"
    >
      <button
        type="button"
        onClick={onClose}
        onPointerUp={onClose}
        className="fixed right-3 top-3 z-[100030] flex h-11 w-11 items-center justify-center rounded-full bg-[#FFFBF0]/90 font-display text-2xl leading-none text-black shadow-md backdrop-blur-sm lg:right-5 lg:top-5"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
        aria-label="Close our story"
      >
        ×
      </button>

      <main className="w-screen max-w-[100vw]">
        <div className="lg:hidden">
          <OurStoryPanelScroll />
        </div>
        <div className="hidden lg:block">
          <OurStoryDesktop />
        </div>
      </main>
    </div>,
    document.body
  );
}
