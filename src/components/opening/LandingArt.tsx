"use client";

import { LANDING } from "./landing-assets";

const BLUSH = "#F3E9E6";

type LandingArtProps = {
  side: "left" | "right";
};

export function LandingArt({ side }: LandingArtProps) {
  const isLeft = side === "left";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundColor: BLUSH }}
      aria-hidden
    >
      <div
        className="relative h-[100dvh] w-[100vw]"
        style={{
          marginLeft: isLeft ? 0 : "-50vw",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING}
          alt=""
          decoding="sync"
          fetchPriority="high"
          draggable={false}
          className="absolute left-1/2 top-1/2 h-[100dvh] w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
        />
      </div>
    </div>
  );
}
