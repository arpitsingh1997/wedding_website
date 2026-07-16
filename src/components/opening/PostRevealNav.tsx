"use client";

import type { MouseEvent } from "react";
import { WeddingCountdown } from "./WeddingCountdown";
import { LANDING3_SCROLL } from "./welcome-assets";

/**
 * Hit boxes measured from landing3@2x.png maroon text bands (1080×1920).
 * Our Story → story scroll only. Save the Date → video only.
 */
const NAV_ITEMS = [
  {
    label: "Our Story",
    href: "#our-story",
    id: "our-story" as const,
    top: "41.2%",
    height: "5.8%",
  },
  {
    label: "Save the Date",
    href: "#save-the-date",
    id: "save-the-date" as const,
    top: "49.2%",
    height: "5.8%",
  },
  {
    label: "Wedding Events",
    href: "#events",
    top: "60.2%",
    height: "5.8%",
  },
  {
    label: "Celebrating Together",
    href: "#celebrating-together",
    top: "68.0%",
    height: "11.0%",
  },
] as const;

type NavItemId = "our-story" | "save-the-date";

type NavItem = {
  label: string;
  href: string;
  id?: NavItemId;
  top: string;
  height: string;
};

type PostRevealNavProps = {
  reveal?: boolean;
  onOurStoryClick?: () => void;
  onSaveTheDateClick?: () => void;
};

export function PostRevealNav({
  onOurStoryClick,
  onSaveTheDateClick,
}: PostRevealNavProps) {
  const handleItemClick = (item: NavItem, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.id === "our-story") {
      onOurStoryClick?.();
      return;
    }
    if (item.id === "save-the-date") {
      onSaveTheDateClick?.();
    }
  };

  return (
    <section
      id="countdown-nav"
      className="relative w-full bg-[#FFF8ED]"
      aria-label="Invitation details"
      data-page="landing3-scroll"
    >
      <div className="relative mx-auto w-full max-w-[540px] lg:max-w-[480px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING3_SCROLL}
          alt="Countdown to our forever — Dharmi and Arpit"
          className="block h-auto w-full select-none"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />

        {/* Under “Countdown to our forever”, above the lotus divider */}
        <div
          className="pointer-events-none absolute inset-x-0 z-[1] flex justify-center px-5"
          style={{ top: "24.5%" }}
        >
          <WeddingCountdown />
        </div>

        <nav className="absolute inset-0 z-[2]" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="absolute inset-x-[8%] cursor-pointer"
              style={{ top: item.top, height: item.height }}
              aria-label={item.label}
              data-nav={"id" in item ? item.id : item.href}
              onClick={(e) => handleItemClick(item, e)}
            >
              <span className="sr-only">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
