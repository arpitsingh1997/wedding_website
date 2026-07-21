"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { PRESS_HOLD_MS } from "./invite-nav-motion";
import { openInstagramProfile } from "./open-instagram";
import { PAGE_CREAM } from "./page-cream";
import { WeddingCountdown } from "./WeddingCountdown";
import { LANDING3_DESKTOP, LANDING3_SCROLL } from "./welcome-assets";

const INSTAGRAM_URL = "https://www.instagram.com/dharmiandarpit";

/**
 * Phone hit boxes — exact printed button frames on landing3@2x.png (1080×1920).
 * Same L/W/H as Our Story so every press scales the real border the same way.
 */
const MOBILE_BTN = {
  left: "10.2%",
  width: "79.6%",
  height: "5.21%",
} as const;

const MOBILE_NAV_ITEMS = [
  {
    label: "Our Story",
    href: "#our-story",
    id: "our-story" as const,
    top: "40.73%",
    ...MOBILE_BTN,
  },
  {
    label: "Save the Date",
    href: "#save-the-date",
    id: "save-the-date" as const,
    top: "48.44%",
    ...MOBILE_BTN,
  },
  {
    label: "Wedding Events",
    href: "#events",
    top: "56.15%",
    ...MOBILE_BTN,
  },
  {
    label: "Celebrating Together",
    href: "#celebrating-together",
    id: "celebrating-together" as const,
    top: "63.91%",
    ...MOBILE_BTN,
  },
  {
    label: "More of Us",
    href: INSTAGRAM_URL,
    id: "more-of-us" as const,
    top: "71.61%",
    ...MOBILE_BTN,
  },
] as const;

/**
 * Desktop hit boxes — desklanding3@2x.png (1366×768).
 * 2×2 grid + More of Us (Instagram), matching mobile destinations.
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
    id: "celebrating-together" as const,
    top: "55.1%",
    left: "52.2%",
    width: "16.4%",
    height: "8.8%",
  },
  {
    label: "More of Us",
    href: INSTAGRAM_URL,
    id: "more-of-us" as const,
    top: "67.2%",
    left: "31.3%",
    width: "37.3%",
    height: "5.8%",
  },
] as const;

export type InviteNavDestination =
  | "our-story"
  | "save-the-date"
  | "celebrating-together"
  | "more-of-us";

type NavItemId = InviteNavDestination;

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
  /** True while a page transition is running — blocks extra taps */
  navigationLocked?: boolean;
  /** Gesture-safe prep (audio / mount) on press */
  onPressStart?: (id: InviteNavDestination) => void;
  /** Finger/mouse cancelled before navigate — roll back prep */
  onPressCancel?: () => void;
  /** After press hold — begin fade + open destination */
  onNavigate?: (id: InviteNavDestination) => void;
};

export function PostRevealNav({
  navigationLocked = false,
  onPressStart,
  onPressCancel,
  onNavigate,
}: PostRevealNavProps) {
  const isDesktop = useIsDesktop();
  const artSrc = isDesktop ? LANDING3_DESKTOP : LANDING3_SCROLL;
  const navItems: readonly NavItem[] = isDesktop ? DESKTOP_NAV_ITEMS : MOBILE_NAV_ITEMS;

  const [pressedId, setPressedId] = useState<string | null>(null);
  const pressStartedAt = useRef(0);
  const activeId = useRef<InviteNavDestination | null>(null);
  const holdTimer = useRef<number | null>(null);
  const navigatedForPress = useRef(false);

  const clearHoldTimer = useCallback(() => {
    if (holdTimer.current != null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearHoldTimer(), [clearHoldTimer]);

  const finishNavigate = useCallback(
    (id: InviteNavDestination) => {
      if (navigatedForPress.current || navigationLocked) return;
      navigatedForPress.current = true;
      setPressedId(null);
      activeId.current = null;
      if (id === "more-of-us") {
        openInstagramProfile("dharmiandarpit");
        return;
      }
      onNavigate?.(id);
    },
    [navigationLocked, onNavigate]
  );

  const scheduleNavigate = useCallback(
    (id: InviteNavDestination) => {
      clearHoldTimer();
      const elapsed = performance.now() - pressStartedAt.current;
      const remain = Math.max(0, PRESS_HOLD_MS - elapsed);
      holdTimer.current = window.setTimeout(() => {
        holdTimer.current = null;
        finishNavigate(id);
      }, remain);
    },
    [clearHoldTimer, finishNavigate]
  );

  const onPointerDown = (item: NavItem, e: PointerEvent<HTMLAnchorElement>) => {
    if (navigationLocked) return;
    if (!item.id) return; // Wedding Events — no destination yet
    if (e.button !== 0 && e.pointerType === "mouse") return;

    e.preventDefault();
    navigatedForPress.current = false;
    pressStartedAt.current = performance.now();
    activeId.current = item.id;
    setPressedId(item.id);
    onPressStart?.(item.id);
  };

  const onPointerUp = (item: NavItem, e: PointerEvent<HTMLAnchorElement>) => {
    if (!item.id || activeId.current !== item.id) return;
    e.preventDefault();
    scheduleNavigate(item.id);
  };

  const onPointerCancel = () => {
    clearHoldTimer();
    const hadPress = activeId.current != null && !navigatedForPress.current;
    navigatedForPress.current = false;
    activeId.current = null;
    setPressedId(null);
    if (hadPress) onPressCancel?.();
  };

  const onClick = (item: NavItem, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Keyboard / accessibility: activate without pointer sequence
    if (!item.id || navigationLocked) return;
    if (navigatedForPress.current) return;
    if (pressedId === item.id) return;
    onPressStart?.(item.id);
    pressStartedAt.current = performance.now();
    setPressedId(item.id);
    scheduleNavigate(item.id);
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
      <div className="relative mx-auto w-full max-w-[540px] md:max-w-none">
        {/* Phone scroll art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING3_SCROLL}
          alt="Countdown to our forever — Dharmi and Arpit"
          className="crisp-image art-phone block h-auto w-full max-w-none select-none"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
        {/* Desktop scroll art — desklanding3@2x */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING3_DESKTOP}
          alt="Countdown to our forever — Dharmi and Arpit"
          className="crisp-image art-desktop block h-auto w-full max-w-none select-none"
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

        <nav
          className="absolute inset-0 z-[2]"
          aria-label="Main navigation"
          style={{ pointerEvents: navigationLocked ? "none" : "auto" }}
        >
          {navItems.map((item) => {
            const isPressed = pressedId === item.id;
            const isDisabled = !item.id;
            const top = parseFloat(item.top) / 100;
            const left = parseFloat(item.left) / 100;
            const width = parseFloat(item.width) / 100;
            const height = parseFloat(item.height) / 100;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`invite-nav-hit absolute ${isDisabled ? "invite-nav-hit--inert" : ""}`}
                style={{
                  top: item.top,
                  left: item.left,
                  width: item.width,
                  height: item.height,
                  // Hide the flat art under a pressed clone so borders don’t double
                  ["--page-cream" as string]: PAGE_CREAM,
                }}
                aria-label={item.label}
                aria-disabled={isDisabled || navigationLocked}
                data-nav={item.id ?? item.href}
                data-pressed={isPressed ? "true" : "false"}
                onPointerDown={(e) => onPointerDown(item, e)}
                onPointerUp={(e) => onPointerUp(item, e)}
                onPointerCancel={onPointerCancel}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") onPointerCancel();
                }}
                onClick={(e) => onClick(item, e)}
              >
                {isPressed && (
                  <span className="invite-nav-press-clip" aria-hidden>
                    <span className="invite-nav-press-mask" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artSrc}
                      alt=""
                      className="invite-nav-press-art"
                      draggable={false}
                      style={{
                        width: `${(1 / width) * 100}%`,
                        height: `${(1 / height) * 100}%`,
                        left: `${(-left / width) * 100}%`,
                        top: `${(-top / height) * 100}%`,
                      }}
                    />
                  </span>
                )}
                <span className="sr-only">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
