"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { kickOurStoryAudio, stopOurStoryAudio } from "./our-story-audio";
import { OurStoryDesktop } from "./our-story/OurStoryDesktop";
import { OurStoryPanelScroll } from "./our-story/OurStoryPanelScroll";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";

type OurStoryScrollProps = {
  open: boolean;
  /** Fade-in when true (invitation page-turn) */
  revealed?: boolean;
  onClose: () => void;
};

/**
 * Our Story — full-bleed scroll.
 * Phone: five PNG panels (1→5) seamless vertical scroll.
 * Mac: single desktop.png seamless scroll.
 */
export function OurStoryScroll({
  open,
  revealed = true,
  onClose,
}: OurStoryScrollProps) {
  const [mounted, setMounted] = useState(false);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      stopOurStoryAudio();
      document.documentElement.classList.remove("is-scroll-locked");
      return;
    }
    document.documentElement.classList.add("is-scroll-locked");
    const panel = document.getElementById("our-story");
    panel?.scrollTo(0, 0);
    kickOurStoryAudio();
    // Do NOT stop audio in cleanup — React Strict Mode remount would kill it
    // right after the tap gesture, leaving silence on iPhone.
    return () => {
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [open]);

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      className="full-viewport z-[100020] select-none overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#FFFBF0]"
      style={{
        WebkitOverflowScrolling: "touch",
        userSelect: "none",
        ...fadeStyle,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Our story"
      id="our-story"
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-3 z-[100030] flex h-11 w-11 items-center justify-center rounded-full bg-[#FFFBF0]/90 font-display text-2xl leading-none text-black shadow-md backdrop-blur-sm lg:right-5"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Close our story"
      >
        ×
      </button>

      <main className="w-full max-w-none">
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
