"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isDesktopViewport } from "@/lib/viewport";
import { OurStoryMobile } from "./our-story/OurStoryMobile";

type OurStoryScrollProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Our Story — full-bleed scroll.
 * Phone: HTML/CSS rebuild (four panels).
 * Mac: single landing7 artwork.
 */
export function OurStoryScroll({ open, onClose }: OurStoryScrollProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => setIsDesktop(isDesktopViewport());
    sync();
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
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
        <OurStoryMobile />
      </main>
    </div>,
    document.body
  );
}
