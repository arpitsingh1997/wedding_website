"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANDING } from "./landing-assets";
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

export function BowScreen({ isUnwrapping, onUnwrap, onUnwrapped }: BowScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [flapsOpening, setFlapsOpening] = useState(false);
  const advanced = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Start CSS flap animation after a short hold (image already painted underneath)
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
    // Same tap gesture unlocks muted autoplay on iOS
    kickInviteVideoPlayback();
    onUnwrap();
  }, [isUnwrapping, onUnwrap]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="full-viewport fixed inset-0 z-[100050]"
      style={{
        width: "100vw",
        backgroundColor: "transparent",
        pointerEvents: isUnwrapping ? "none" : "auto",
      }}
      data-bow-screen={isUnwrapping ? "unwrapping" : "closed"}
      data-bow-version="css-1s-v7"
    >
      {/* Flaps overlap 2px at center so no hairline seam shows */}
      <div
        className={`bow-flap bow-flap-left full-viewport absolute inset-y-0 left-0 z-20 overflow-hidden ${flapsOpening ? "is-opening" : ""}`}
        style={{ width: "calc(50% + 2px)", transformOrigin: "right center" }}
      >
        <LandingArt side="left" />
      </div>

      <div
        className={`bow-flap bow-flap-right full-viewport absolute inset-y-0 right-0 z-20 overflow-hidden ${flapsOpening ? "is-opening" : ""}`}
        style={{ width: "calc(50% + 2px)", transformOrigin: "left center" }}
      >
        <LandingArt side="right" />
      </div>

      {/* Keep full cover until flaps actually start moving */}
      {!flapsOpening && (
        <div className="pointer-events-none absolute inset-0 z-40" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
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
        }}
      >
        {BOW_HINT}
      </p>
    </div>,
    document.body
  );
}
