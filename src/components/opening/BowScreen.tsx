"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANDING, LANDING_DESKTOP } from "./landing-assets";
import { LandingArt } from "./LandingArt";
import { kickInviteVideoPlayback } from "./invite-video";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { DESKTOP_MIN_WIDTH } from "@/lib/viewport";

type BowScreenProps = {
  isUnwrapping: boolean;
  onUnwrap: () => void;
  onUnwrapped: () => void;
};

const BOW_HINT = "TAP BOW TO UNVEIL";

/** ~1s envelope open */
const HOLD_MS = 50;
const FLAP_MS = 1000;
const SETTLE_MS = 50;
const TOTAL_MS = HOLD_MS + FLAP_MS + SETTLE_MS;

export function BowScreen({ isUnwrapping, onUnwrap, onUnwrapped }: BowScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [flapsOpening, setFlapsOpening] = useState(false);
  const advanced = useRef(false);
  const finished = useRef(false);
  const isDesktop = useIsDesktop();
  const bowSrc = isDesktop ? LANDING_DESKTOP : LANDING;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUnwrapping) {
      setFlapsOpening(false);
      return;
    }
    const start = window.setTimeout(() => setFlapsOpening(true), HOLD_MS);
    return () => window.clearTimeout(start);
  }, [isUnwrapping]);

  useEffect(() => {
    if (!isUnwrapping || finished.current) return;
    const id = window.setTimeout(() => {
      finished.current = true;
      onUnwrapped();
    }, TOTAL_MS);
    return () => window.clearTimeout(id);
  }, [isUnwrapping, onUnwrapped]);

  const handleTap = useCallback(() => {
    if (advanced.current || isUnwrapping) return;
    advanced.current = true;
    // Same tap unlocks muted autoplay on iPhone
    if (!window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches) {
      kickInviteVideoPlayback();
    }
    onUnwrap();
  }, [isUnwrapping, onUnwrap]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="full-viewport z-[100050]"
      style={{
        backgroundColor: "transparent",
        pointerEvents: isUnwrapping ? "none" : "auto",
      }}
      data-bow-screen={isUnwrapping ? "unwrapping" : "closed"}
      data-bow-version="css-1s-v9"
    >
      <div
        className={`bow-flap bow-flap-left absolute inset-y-0 left-0 z-20 h-full overflow-hidden ${flapsOpening ? "is-opening" : ""}`}
        style={{
          width: "calc(50% + 2px)",
          transformOrigin: "right center",
        }}
      >
        <LandingArt side="left" />
      </div>

      <div
        className={`bow-flap bow-flap-right absolute inset-y-0 right-0 z-20 h-full overflow-hidden ${flapsOpening ? "is-opening" : ""}`}
        style={{
          width: "calc(50% + 2px)",
          transformOrigin: "left center",
        }}
      >
        <LandingArt side="right" />
      </div>

      {!flapsOpening && (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bowSrc} alt="" className="cover-media" draggable={false} />
        </div>
      )}

      {!isUnwrapping && (
        <button
          type="button"
          onPointerUp={handleTap}
          onClick={handleTap}
          className="absolute inset-0 z-50 cursor-pointer border-0 bg-transparent"
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
          aria-label="Unwrap invitation"
        />
      )}

      <p
        className="pointer-events-none absolute bottom-10 left-0 right-0 z-[60] text-center font-display text-xs font-light tracking-[0.35em] text-[#5C4A42]/60 sm:text-sm"
        style={{
          textTransform: "uppercase",
          opacity: isUnwrapping ? 0 : 1,
          transition: "opacity 1.2s ease",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {BOW_HINT}
      </p>
    </div>,
    document.body
  );
}
