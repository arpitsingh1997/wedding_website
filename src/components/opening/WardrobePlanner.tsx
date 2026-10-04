"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PAGE_CREAM } from "./page-cream";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import { WARDROBE_PLANNER_MOBILE_PAGES } from "./welcome-assets";

type WardrobePlannerProps = {
  open: boolean;
  revealed?: boolean;
  onClose: () => void;
};

/** Full-page Wardrobe Planner sequence (phone only for now: 1→6). */
export function WardrobePlanner({
  open,
  revealed = true,
  onClose,
}: WardrobePlannerProps) {
  const [mounted, setMounted] = useState(false);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("is-scroll-locked");
    document.getElementById("wardrobe-planner")?.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [open]);

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      id="wardrobe-planner"
      className="full-viewport z-[100020] select-none overflow-y-auto overflow-x-hidden overscroll-y-contain"
      style={{
        backgroundColor: PAGE_CREAM,
        WebkitOverflowScrolling: "touch",
        userSelect: "none",
        ...fadeStyle,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Wardrobe planner"
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-3 z-[100030] flex h-11 w-11 items-center justify-center rounded-full font-display text-2xl leading-none shadow-md"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          color: "#5C1A1A",
          backgroundColor: PAGE_CREAM,
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Close wardrobe planner"
      >
        ×
      </button>

      <main className="w-full leading-[0]">
        {WARDROBE_PLANNER_MOBILE_PAGES.map((src, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`Wardrobe planner, page ${index + 1} of ${WARDROBE_PLANNER_MOBILE_PAGES.length}`}
            className="block h-auto w-full max-w-none"
            decoding={index === 0 ? "sync" : "async"}
            fetchPriority={index === 0 ? "high" : "auto"}
            draggable={false}
          />
        ))}
      </main>
    </div>,
    document.body
  );
}
