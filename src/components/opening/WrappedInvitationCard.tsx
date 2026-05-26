"use client";

import { motion } from "framer-motion";
import { revealEase } from "@/lib/motion";
import { LandingArt } from "./LandingArt";
import { phaseAtOrPast } from "@/lib/phase-utils";
import type { OpeningPhase } from "./types";

const BLUSH_IVORY = "#F3E9E6";
const FLAP_TRANSITION = { duration: 0.75, ease: revealEase };

type WrappedInvitationCardProps = {
  phase: OpeningPhase;
};

function FlapHalf({
  side,
  flapsOpen,
}: {
  side: "left" | "right";
  flapsOpen: boolean;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-y-0 z-20 h-[100dvh] w-1/2 overflow-hidden ${side === "left" ? "left-0" : "right-0"}`}
      style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
      initial={{ x: "0%" }}
      animate={{
        x: flapsOpen ? (side === "left" ? "-100%" : "100%") : "0%",
        opacity: flapsOpen ? 0 : 1,
      }}
      transition={FLAP_TRANSITION}
    >
      <LandingArt side={side} />
    </motion.div>
  );
}

export function WrappedInvitationCard({ phase }: WrappedInvitationCardProps) {
  const flapsOpen = phaseAtOrPast(phase, "flaps");
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 h-[100dvh] w-[100vw] overflow-hidden"
      style={{ backgroundColor: flapsOpen ? "transparent" : BLUSH_IVORY }}
    >
      <FlapHalf side="left" flapsOpen={flapsOpen} />
      <FlapHalf side="right" flapsOpen={flapsOpen} />
    </div>
  );
}
