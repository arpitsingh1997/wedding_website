"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PAGE_CREAM } from "./page-cream";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import {
  WARDROBE_PLANNER_DESKTOP_PAGES,
  WARDROBE_PLANNER_MOBILE_PAGES,
} from "./welcome-assets";

/** Matches the planner art's own background so there's no seam while pages load. */
const PLANNER_BACKGROUND = "#FDF6EC";

type WardrobePlannerProps = {
  open: boolean;
  revealed?: boolean;
  onClose: () => void;
};

/** `art-phone` / `art-desktop` switch at the same width as the menu art. */
function PlannerPages({
  pages,
  artClass,
}: {
  pages: readonly string[];
  artClass: "art-phone" | "art-desktop";
}) {
  return pages.map((src, index) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={`Wardrobe planner, page ${index + 1} of ${pages.length}`}
      className={`${artClass} block h-auto w-full max-w-none`}
      decoding={index === 0 ? "sync" : "async"}
      fetchPriority={index === 0 ? "high" : "auto"}
      draggable={false}
    />
  ));
}

/** Full-page Wardrobe Planner: panels fill the screen width and scroll vertically. */
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
        backgroundColor: PLANNER_BACKGROUND,
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
        className="fixed right-3 z-[100030] flex h-11 w-11 items-center justify-center rounded-full font-display text-2xl leading-none shadow-md lg:right-5"
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
        <PlannerPages pages={WARDROBE_PLANNER_MOBILE_PAGES} artClass="art-phone" />
        <PlannerPages pages={WARDROBE_PLANNER_DESKTOP_PAGES} artClass="art-desktop" />
      </main>
    </div>,
    document.body
  );
}
