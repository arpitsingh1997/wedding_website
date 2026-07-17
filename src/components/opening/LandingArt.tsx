"use client";

import { LANDING, LANDING_DESKTOP } from "./landing-assets";
import { PAGE_CREAM } from "./page-cream";
import { useIsDesktop } from "@/lib/use-is-desktop";

type LandingArtProps = {
  side: "left" | "right";
};

export function LandingArt({ side }: LandingArtProps) {
  const isLeft = side === "left";
  const isDesktop = useIsDesktop();
  const src = isDesktop ? LANDING_DESKTOP : LANDING;

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          decoding="sync"
          fetchPriority="high"
          draggable={false}
          className="cover-media"
        />
      </div>
    </div>
  );
}
