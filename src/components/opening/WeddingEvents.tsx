"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PAGE_CREAM } from "./page-cream";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import {
  WEDDING_EVENTS_DESKTOP_PAGES,
  WEDDING_EVENTS_MOBILE_PAGES,
} from "./welcome-assets";
import { addWeddingEventsToCalendar } from "./wedding-events-calendar";

type WeddingEventsProps = {
  open: boolean;
  revealed?: boolean;
  onClose: () => void;
};

function EventPages({
  pages,
  wrapperClass,
}: {
  pages: readonly string[];
  wrapperClass: string;
}) {
  return (
    <div className={`w-full leading-[0] ${wrapperClass}`}>
      {pages.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`Wedding event, page ${index + 1} of ${pages.length}`}
          className="block h-auto w-full max-w-none"
          decoding={index === 0 ? "sync" : "async"}
          fetchPriority={index === 0 ? "high" : "auto"}
          draggable={false}
        />
      ))}
    </div>
  );
}

/** Full-page Wedding Events sequence: phone 5→9, desktop 8→12. */
export function WeddingEvents({
  open,
  revealed = true,
  onClose,
}: WeddingEventsProps) {
  const [mounted, setMounted] = useState(false);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("is-scroll-locked");
    document.getElementById("wedding-events")?.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [open]);

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      id="wedding-events"
      className="full-viewport z-[100020] select-none overflow-y-auto overflow-x-hidden overscroll-y-contain"
      style={{
        backgroundColor: PAGE_CREAM,
        WebkitOverflowScrolling: "touch",
        userSelect: "none",
        ...fadeStyle,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Wedding events"
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
        aria-label="Close wedding events"
      >
        ×
      </button>

      <button
        type="button"
        onClick={() => addWeddingEventsToCalendar()}
        className="fixed left-3 z-[100030] rounded-full px-3.5 py-2 font-display text-[11px] font-light tracking-[0.14em] uppercase shadow-md lg:left-5"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          color: "#5C1A1A",
          backgroundColor: PAGE_CREAM,
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Add wedding events to calendar"
      >
        Add to calendar
      </button>

      <main className="w-full">
        <EventPages
          pages={WEDDING_EVENTS_MOBILE_PAGES}
          wrapperClass="lg:hidden"
        />
        <EventPages
          pages={WEDDING_EVENTS_DESKTOP_PAGES}
          wrapperClass="hidden lg:block"
        />
      </main>
    </div>,
    document.body
  );
}
