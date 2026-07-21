"use client";

import { LANDING, LANDING_DESKTOP } from "./landing-assets";
import { PAGE_CREAM } from "./page-cream";
import { DESKTOP_MIN_WIDTH } from "@/lib/viewport";

type LandingArtProps = {
  side: "left" | "right";
};

export function LandingArt({ side }: LandingArtProps) {
  const isLeft = side === "left";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ backgroundColor: PAGE_CREAM }}
      aria-hidden
    >
      {/* Full-screen art clipped by the half-width flap (50% of parent) */}
      <div
        className="absolute inset-y-0 h-full overflow-hidden"
        style={{
          width: "200%",
          left: isLeft ? 0 : "-100%",
        }}
      >
        <picture>
          <source
            media={`(min-width: ${DESKTOP_MIN_WIDTH}px)`}
            srcSet={LANDING_DESKTOP}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING}
            alt=""
            decoding="sync"
            fetchPriority="high"
            draggable={false}
            className="cover-media"
          />
        </picture>
      </div>
    </div>
  );
}
