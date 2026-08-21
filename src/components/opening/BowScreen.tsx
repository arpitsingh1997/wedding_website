"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  preloadBowOpeningSound,
  startBowOpeningSound,
} from "./bow-opening-sound";
import { LANDING, LANDING_DESKTOP } from "./landing-assets";
import { LandingArt } from "./LandingArt";
import { kickInviteVideoPlayback } from "./invite-video";

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

/**
 * Closed-bow overlay. Rendered in-tree (not a portal) so it covers the invite
 * on the first paint — including SSR/hydration — with no invite flash.
 */
export function BowScreen({ isUnwrapping, onUnwrap, onUnwrapped }: BowScreenProps) {
  const [flapsOpening, setFlapsOpening] = useState(false);
  const advanced = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    preloadBowOpeningSound();
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
    // Same tap: shimmer + muted invite bells (iPhone gesture window)
    startBowOpeningSound();
    kickInviteVideoPlayback();
    onUnwrap();
  }, [isUnwrapping, onUnwrap]);

  return (
    <div
      className="full-viewport z-[100050]"
      style={{
        // Transparent so the invite (already mounted underneath) peeks as flaps open
        backgroundColor: "transparent",
        pointerEvents: isUnwrapping ? "none" : "auto",
      }}
      data-bow-screen={isUnwrapping ? "unwrapping" : "closed"}
      data-bow-version="piano-g4-d5-overlap-v1"
      data-desktop-flow="desklanding-1-2-3"
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
          <img
            src={LANDING}
            alt=""
            className="cover-media art-phone"
            decoding="sync"
            fetchPriority="high"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_DESKTOP}
            alt=""
            className="cover-media art-desktop"
            decoding="sync"
            fetchPriority="high"
            draggable={false}
          />
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
    </div>
  );
}
