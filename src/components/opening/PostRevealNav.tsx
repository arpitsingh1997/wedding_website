"use client";

import type { MouseEvent, PointerEvent } from "react";
import { motion } from "framer-motion";
import { luxuryEase } from "@/lib/motion";

const NAV_ROW_ONE = [
  { label: "Home", href: "#home", id: "home" as const },
  { label: "Our Story", href: "#our-story", id: "our-story" as const },
  { label: "Save the Date", href: "#save-the-date", id: "save-the-date" as const },
] as const;

const NAV_ROW_TWO = [
  { label: "Events", href: "#events" },
  { label: "Our People", href: "#our-people" },
] as const;

const NAV_ITEMS = [...NAV_ROW_ONE, ...NAV_ROW_TWO] as const;

type NavItemId = "home" | "our-story" | "save-the-date";

type NavItem = {
  label: string;
  href: string;
  id?: NavItemId;
};

type PostRevealNavProps = {
  reveal?: boolean;
  onHomeClick?: () => void;
  onOurStoryClick?: () => void;
  onSaveTheDateClick?: () => void;
};

type NavRowProps = {
  items: readonly NavItem[];
  startIndex: number;
  reveal: boolean;
  linkClass: string;
  dotClass: string;
  listClass: string;
  onItemClick: (item: NavItem, e: MouseEvent<HTMLAnchorElement> | PointerEvent<HTMLAnchorElement>) => void;
};

function NavRow({
  items,
  startIndex,
  reveal,
  linkClass,
  dotClass,
  listClass,
  onItemClick,
}: NavRowProps) {
  return (
    <ul className={listClass}>
      {items.map((item, index) => {
        const globalIndex = startIndex + index;
        return (
          <motion.li
            key={item.label}
            className="flex items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={reveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{
              duration: 0.85,
              delay: 0.9 + globalIndex * 0.1,
              ease: luxuryEase,
            }}
          >
            {index > 0 && (
              <span className={dotClass} aria-hidden>
                ·
              </span>
            )}
            <a
              href={item.href}
              className={linkClass}
              onClick={(e) => onItemClick(item, e)}
              onPointerUp={(e) => {
                if (item.id === "save-the-date" || item.id === "home" || item.id === "our-story") {
                  onItemClick(item, e);
                }
              }}
            >
              {item.label}
            </a>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function PostRevealNav({
  reveal = true,
  onHomeClick,
  onOurStoryClick,
  onSaveTheDateClick,
}: PostRevealNavProps) {
  const mobileLinkClass =
    "px-0.5 py-0.5 font-bold text-black text-sm tracking-[0.08em] uppercase [-webkit-text-stroke:0.35px_#000] [paint-order:stroke_fill] [text-shadow:0_0_10px_rgba(255,255,255,0.95),0_1px_2px_rgba(255,255,255,0.8)] transition-colors hover:text-black/80 focus:outline-none focus-visible:text-black/80 lg:font-bold";

  const desktopLinkClass =
    "px-1 py-0.5 font-bold text-black transition-colors hover:text-black/75 focus:outline-none focus-visible:text-black/75";

  const mobileDotClass =
    "mx-0.5 text-sm font-bold text-black/55 [-webkit-text-stroke:0.25px_#000] [paint-order:stroke_fill] [text-shadow:0_0_8px_rgba(255,255,255,0.9)] sm:mx-1";

  const desktopDotClass = "mx-2 font-bold text-black/40 lg:mx-3";

  const mobileRowListClass =
    "flex max-w-[100vw] flex-wrap items-center justify-center gap-x-0 font-display uppercase";

  const desktopRowListClass =
    "flex max-w-[100vw] flex-wrap items-center justify-center gap-x-0.5 font-display text-[10px] tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.18em] lg:gap-x-1 lg:text-xs lg:tracking-[0.2em]";

  const handleItemClick = (
    item: NavItem,
    e: MouseEvent<HTMLAnchorElement> | PointerEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (item.id === "home") {
      onHomeClick?.();
      return;
    }
    if (item.id === "our-story") {
      onOurStoryClick?.();
      return;
    }
    if (item.id === "save-the-date") {
      onSaveTheDateClick?.();
    }
  };

  return (
    <nav
      className="pointer-events-auto absolute inset-x-0 top-0 z-[100010] flex justify-center px-3 pt-1.5 sm:px-4 sm:pt-2"
      aria-label="Main navigation"
    >
      <div className="flex flex-col items-center gap-0.5 lg:hidden">
        <NavRow
          items={NAV_ROW_ONE}
          startIndex={0}
          reveal={reveal}
          linkClass={mobileLinkClass}
          dotClass={mobileDotClass}
          listClass={mobileRowListClass}
          onItemClick={handleItemClick}
        />
        <NavRow
          items={NAV_ROW_TWO}
          startIndex={NAV_ROW_ONE.length}
          reveal={reveal}
          linkClass={mobileLinkClass}
          dotClass={mobileDotClass}
          listClass={mobileRowListClass}
          onItemClick={handleItemClick}
        />
      </div>

      <NavRow
        items={NAV_ITEMS}
        startIndex={0}
        reveal={reveal}
        linkClass={desktopLinkClass}
        dotClass={desktopDotClass}
        listClass={`${desktopRowListClass} hidden lg:flex`}
        onItemClick={handleItemClick}
      />
    </nav>
  );
}
