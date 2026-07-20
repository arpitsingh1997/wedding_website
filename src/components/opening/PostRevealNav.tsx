"use client";

import type { MouseEvent } from "react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { PAGE_CREAM } from "./page-cream";
import { WeddingCountdown } from "./WeddingCountdown";
import { LANDING3_DESKTOP, LANDING3_SCROLL } from "./welcome-assets";

/**
 * Phone hit boxes — measured from landing3@2x.png (1080×1920) vertical stack.
 */
const MOBILE_NAV_ITEMS = [
  {
    label: "Our Story",
    href: "#our-story",
    id: "our-story" as const,
    top: "40.7%",
    left: "14%",
    width: "72%",
    height: "5.2%",
  },
  {
    label: "Save the Date",
    href: "#save-the-date",
    id: "save-the-date" as const,
    top: "50.2%",
    left: "14%",
    width: "72%",
    height: "5.2%",
  },
  {
    label: "Wedding Events",
    href: "#events",
    top: "59.6%",
    left: "14%",
    width: "72%",
    height: "5.2%",
  },
  {
    label: "Celebrating Together",
    href: "#celebrating-together",
    top: "69.1%",
    left: "14%",
    width: "72%",
    height: "9.5%",
  },
] as const;

/**
 * Desktop hit boxes — measured from desklanding3@2x.png (1366×768) 2×2 grid.
 * Our Story | Events
 * Save the Date | Celebrating Together
 */
const DESKTOP_NAV_ITEMS = [
  {
    label: "Our Story",
    href: "#our-story",
    id: "our-story" as const,
    top: "42.2%",
    left: "31.3%",
    width: "16.4%",
    height: "5.8%",
  },
  {
    label: "Wedding Events",
    href: "#events",
    top: "42.2%",
    left: "52.2%",
    width: "16.4%",
    height: "5.8%",
  },
  {
    label: "Save the Date",
    href: "#save-the-date",
    id: "save-the-date" as const,
    top: "55.1%",
    left: "31.3%",
    width: "16.4%",
    height: "8.8%",
  },
  {
    label: "Celebrating Together",
    href: "#celebrating-together",
    top: "55.1%",
    left: "52.2%",
    width: "16.4%",
    height: "8.8%",
  },
] as const;

type NavItemId = "our-story" | "save-the-date";

type NavItem = {
  label: string;
  href: string;
  id?: NavItemId;
  top: string;
  left: string;
  width: string;
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
  const isDesktop = useIsDesktop();
  const artSrc = isDesktop ? LANDING3_DESKTOP : LANDING3_SCROLL;
  const navItems: readonly NavItem[] = isDesktop ? DESKTOP_NAV_ITEMS : MOBILE_NAV_ITEMS;

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
      className="relative w-full"
      style={{ backgroundColor: PAGE_CREAM }}
      aria-label="Invitation details"
      data-page="landing3-scroll"
      data-layout={isDesktop ? "desktop" : "mobile"}
    >
      <div
        className={
          isDesktop
            ? "relative mx-auto w-full max-w-none"
            : "relative mx-auto w-full max-w-none sm:max-w-[540px] lg:max-w-[480px]"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artSrc}
          alt="Countdown to our forever — Dharmi and Arpit"
          className="crisp-image block h-auto w-full max-w-none select-none"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />

        <div
          className="pointer-events-none absolute inset-x-0 z-[1] flex justify-center px-5"
          style={{ top: isDesktop ? "28%" : "25.5%" }}
        >
          <WeddingCountdown />
        </div>

        <nav className="absolute inset-0 z-[2]" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="absolute cursor-pointer"
              style={{
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
              }}
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
