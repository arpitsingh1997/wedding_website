"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { luxuryEase, revealEase } from "@/lib/motion";
import type { OpeningPhase } from "./types";
import { SatinBow } from "./SatinBow";

const BOW_TRANSITION = { duration: 0.45, ease: luxuryEase };
const RIBBON_TRANSITION = { duration: 0.35, ease: revealEase };

const RIBBON_STYLE: CSSProperties = {
  background:
    "linear-gradient(90deg, #E8E4DE 0%, #FAFAF8 28%, #FFFFFF 50%, #F5F2ED 72%, #E0DCD6 100%)",
  boxShadow:
    "inset -2px 0 5px rgba(255,255,255,0.75), inset 2px 0 3px rgba(170,165,158,0.12), 0 0 20px rgba(92,74,66,0.07)",
};

type SatinRibbonBowProps = {
  phase: OpeningPhase;
  onBowClick: () => void;
};

function phaseAtOrPast(current: OpeningPhase, target: OpeningPhase): boolean {
  const order: OpeningPhase[] = ["closed", "bow", "ribbon", "flaps", "open"];
  return order.indexOf(current) >= order.indexOf(target);
}

export function SatinRibbonBow({ phase, onBowClick }: SatinRibbonBowProps) {
  const isClosed = phase === "closed";
  const isOpening = phaseAtOrPast(phase, "bow");
  const ribbonSplit = phaseAtOrPast(phase, "ribbon");
  const hidden = phaseAtOrPast(phase, "flaps");

  const ribbonOffset = ribbonSplit ? -24 : 0;
  const ribbonOffsetRight = ribbonSplit ? 24 : 0;
  const ribbonWidth = "clamp(44px, 7.5vw, 64px)";

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Left vertical ribbon — right edge on center seam */}
      <motion.div
        className="absolute top-0 z-20"
        style={{
          ...RIBBON_STYLE,
          right: "50%",
          width: ribbonWidth,
          height: "100%",
        }}
        initial={{ x: 0, opacity: 1 }}
        animate={{
          x: ribbonOffset,
          opacity: hidden ? 0 : ribbonSplit ? 0.5 : 1,
        }}
        transition={RIBBON_TRANSITION}
      />

      {/* Right vertical ribbon — left edge on center seam */}
      <motion.div
        className="absolute top-0 z-20"
        style={{
          ...RIBBON_STYLE,
          left: "50%",
          width: ribbonWidth,
          height: "100%",
        }}
        initial={{ x: 0, opacity: 1 }}
        animate={{
          x: ribbonOffsetRight,
          opacity: hidden ? 0 : ribbonSplit ? 0.5 : 1,
        }}
        transition={RIBBON_TRANSITION}
      />

      {/* Center seam accent (always visible until flaps open) */}
      <motion.div
        className="absolute inset-y-0 left-1/2 z-[25] w-[2px] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(196,165,116,0.35) 15%, rgba(92,74,66,0.2) 50%, rgba(196,165,116,0.35) 85%, transparent 100%)",
        }}
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={RIBBON_TRANSITION}
      />

      {/* Bow — centered on seam */}
      <div className="absolute inset-0 z-40 flex items-center justify-center">
        <motion.div
          className="relative"
          style={{
            width: "min(44vw, 260px)",
            height: "min(44vw, 260px)",
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: hidden ? 0 : isOpening ? 0.4 : 1,
            scale: isOpening ? 0.92 : 1,
          }}
          transition={BOW_TRANSITION}
        >
          <motion.button
            type="button"
            onClick={isClosed ? onBowClick : undefined}
            disabled={!isClosed}
            className="pointer-events-auto absolute inset-0 z-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A574]/40 focus-visible:ring-offset-4 disabled:cursor-default"
            aria-label={isClosed ? "Open invitation" : undefined}
            whileHover={isClosed ? { scale: 1.03 } : undefined}
            transition={{ duration: 0.35, ease: luxuryEase }}
          />
          <SatinBow />
        </motion.div>
      </div>
    </div>
  );
}
