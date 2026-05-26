"use client";

import { motion } from "framer-motion";
import { luxuryEase } from "@/lib/motion";

const MONOGRAM_VIDEO = "/monogram-video.mp4";
const BG_CREAM = "#F4EFE6";
const CARD_ASPECT = 1024 / 682;

type WelcomeCelebrationProps = {
  onEnter: () => void;
};

export function WelcomeCelebration({ onEnter }: WelcomeCelebrationProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: BG_CREAM }}
    >
      <div
        className="relative flex shrink-0 overflow-hidden"
        style={{
          aspectRatio: CARD_ASPECT,
          width: `min(100vw, calc(100dvh * ${CARD_ASPECT}))`,
          height: `min(100dvh, calc(100vw / ${CARD_ASPECT}))`,
          maxWidth: "100vw",
          maxHeight: "100dvh",
          backgroundColor: BG_CREAM,
        }}
      >
        <div className="relative h-full w-1/2 shrink-0 overflow-hidden bg-[#F4EFE6]">
          <video
            className="h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Wedding monogram illustration"
          >
            <source src={MONOGRAM_VIDEO} type="video/mp4" />
          </video>
        </div>

        <div className="relative h-full w-1/2 shrink-0 overflow-hidden bg-[#F4EFE6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/welcome-text@2x.png"
            srcSet="/welcome-text.png 512w, /welcome-text@2x.png 1024w"
            sizes="50vw"
            alt="Arpit and Dharmi — January 25–26, 2027, Jaipur"
            className="h-full w-full object-contain object-center"
            decoding="sync"
            fetchPriority="high"
            draggable={false}
          />
        </div>

        <motion.button
          type="button"
          onClick={onEnter}
          className="absolute bottom-[5%] right-[3%] z-10 cursor-pointer rounded-sm bg-transparent transition-colors hover:bg-[#8B2942]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2942]/40 focus-visible:ring-offset-2"
          style={{
            width: "min(42%, 320px)",
            height: "min(14%, 72px)",
          }}
          aria-label="Enter our celebration"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: luxuryEase }}
        />
      </div>
    </div>
  );
}
