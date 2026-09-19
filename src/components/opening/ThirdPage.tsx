"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { flushSync } from "react-dom";
import { kickOurStoryAudio, preloadOurStoryAudio, stopOurStoryAudio } from "./our-story-audio";
import {
  PAGE_FADE_IN_MS,
  PAGE_FADE_OUT_MS,
  waitMs,
} from "./invite-nav-motion";
import {
  isDestinationStep,
  pushDestinationStep,
  pushInviteStep,
  readInviteStep,
  type InviteHistoryStep,
} from "./invite-history";
import { armMutedLoopVideo, playMutedLoopVideo } from "./invite-video";
import { CelebratingTogetherSection } from "./CelebratingTogetherSection";
import { OurStoryScroll } from "./OurStoryScroll";
import { PAGE_CREAM } from "./page-cream";
import { PostRevealNav, type InviteNavDestination } from "./PostRevealNav";
import { WeddingEvents } from "./WeddingEvents";
import {
  CELEBRATING_TOGETHER,
  CELEBRATING_TOGETHER_DESKTOP,
  LANDING2_DESKTOP,
  LANDING2_PHONE,
  LANDING2A_DESKTOP_VIDEO,
  LANDING2A_VIDEO,
  LANDING3_DESKTOP,
  LANDING3_SCROLL,
} from "./welcome-assets";

type ThirdPageProps = {
  /** Invite is visible (bow opening or fully open) — keep video playing */
  inviteActive?: boolean;
  /** Guest can tap/scroll the invite (bow fully gone) */
  interactive?: boolean;
};

export type ThirdPageHandle = {
  applyHistoryStep: (step: InviteHistoryStep) => void;
  resetToInviteTop: () => void;
};

/** Keep muted looping playback alive (Safari + Chrome). Phone only. */
function useLoopingInviteVideo(
  ref: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const play = () => playMutedLoopVideo(el);

    armMutedLoopVideo(el);
    play();

    const onVisibility = () => {
      if (document.visibilityState === "visible") play();
    };

    el.addEventListener("loadeddata", play);
    el.addEventListener("canplay", play);
    el.addEventListener("ended", play);
    document.addEventListener("visibilitychange", onVisibility);

    const keepAlive = window.setInterval(() => {
      if (el.paused) play();
    }, 3000);

    return () => {
      window.clearInterval(keepAlive);
      el.removeEventListener("loadeddata", play);
      el.removeEventListener("canplay", play);
      el.removeEventListener("ended", play);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref, enabled]);
}

const AUTO_SCROLL_DELAY_MS = 20_000;
/** Idle on the menu page → ease down to Celebrating Together */
const MENU_TO_CELEBRATING_DELAY_MS = 20_000;

/** Invitation page — phone PNG + video layer / desktop art, then countdown + nav */
export const ThirdPage = forwardRef<ThirdPageHandle, ThirdPageProps>(
  function ThirdPage(
    { inviteActive = true, interactive = true },
    ref
  ) {
  const [revealed, setRevealed] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);
  const [weddingEventsOpen, setWeddingEventsOpen] = useState(false);
  /** Soft fade-in for overlays (invitation page-turn) */
  const [overlayRevealed, setOverlayRevealed] = useState(false);
  /** Fade the invite/scroll surface out while opening a destination */
  const [homeFadedOut, setHomeFadedOut] = useState(false);
  const [navigationLocked, setNavigationLocked] = useState(false);
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const deskVideoRef = useRef<HTMLVideoElement>(null);
  const isDesktop = useIsDesktop();
  const navBusy = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLoopingInviteVideo(phoneVideoRef, true);
  useLoopingInviteVideo(deskVideoRef, true);

  useEffect(() => {
    // Prefetch desktop + phone frames so the bow open never waits
    const invitePhone = new Image();
    invitePhone.src = LANDING2_PHONE;
    const inviteDesk = new Image();
    inviteDesk.src = LANDING2_DESKTOP;
    const scrollPhone = new Image();
    scrollPhone.src = LANDING3_SCROLL;
    const scrollDesk = new Image();
    scrollDesk.src = LANDING3_DESKTOP;
    const celebrating = new Image();
    celebrating.src = CELEBRATING_TOGETHER;
    const celebratingDesk = new Image();
    celebratingDesk.src = CELEBRATING_TOGETHER_DESKTOP;
    // Warm invite bells from the start (same multiply overlay as desktop)
    const inviteBellsPhone = document.createElement("video");
    inviteBellsPhone.muted = true;
    inviteBellsPhone.preload = "auto";
    inviteBellsPhone.playsInline = true;
    inviteBellsPhone.src = LANDING2A_VIDEO;
    const inviteBellsDesk = document.createElement("video");
    inviteBellsDesk.muted = true;
    inviteBellsDesk.preload = "auto";
    inviteBellsDesk.playsInline = true;
    inviteBellsDesk.src = LANDING2A_DESKTOP_VIDEO;
    // Warm Celebrating Together with the same landing2a bells
    const celebratingBells = document.createElement("video");
    celebratingBells.muted = true;
    celebratingBells.preload = "auto";
    celebratingBells.playsInline = true;
    celebratingBells.src = LANDING2A_VIDEO;
    const celebratingBellsDesk = document.createElement("video");
    celebratingBellsDesk.muted = true;
    celebratingBellsDesk.preload = "auto";
    celebratingBellsDesk.playsInline = true;
    celebratingBellsDesk.src = LANDING2A_DESKTOP_VIDEO;
    // Warm Our Story clip so tap → sound is immediate
    preloadOurStoryAudio();
  }, []);

  const scrollToCountdown = useCallback((smooth = true) => {
    const menu = document.getElementById("countdown-nav");
    if (!menu) return;
    const top = menu.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const scrollToCelebrating = useCallback((smooth = true) => {
    const section = document.getElementById("celebrating-together");
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const goToCountdown = useCallback(() => {
    pushInviteStep("scroll");
    scrollToCountdown(true);
  }, [scrollToCountdown]);

  const goToCelebrating = useCallback(() => {
    scrollToCelebrating(true);
  }, [scrollToCelebrating]);

  // If the guest stays on the invite, ease them to the countdown
  useEffect(() => {
    if (!interactive) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || window.scrollY >= 12) return;
      goToCountdown();
    }, AUTO_SCROLL_DELAY_MS);

    const onScroll = () => {
      if (window.scrollY >= 12) {
        cancelled = true;
        window.clearTimeout(timer);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [interactive, goToCountdown]);

  // Idle on the menu → ease down to Celebrating Together after 30s
  useEffect(() => {
    if (!interactive) return;

    const menu = document.getElementById("countdown-nav");
    const celebrating = document.getElementById("celebrating-together");
    if (!menu || !celebrating) return;

    let cancelled = false;
    let armed = false;
    let timer: number | null = null;

    const clearTimer = () => {
      if (timer != null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const celebratingAlreadyNear = () =>
      celebrating.getBoundingClientRect().top < window.innerHeight * 0.85;

    const arm = () => {
      if (cancelled || armed) return;
      if (celebratingAlreadyNear()) {
        cancelled = true;
        return;
      }
      armed = true;
      timer = window.setTimeout(() => {
        if (cancelled || celebratingAlreadyNear()) return;
        scrollToCelebrating(true);
      }, MENU_TO_CELEBRATING_DELAY_MS);
    };

    const onScroll = () => {
      // Guest scrolled toward Celebrating Together — don't fight them
      if (celebratingAlreadyNear()) {
        cancelled = true;
        clearTimer();
      }
    };

    const onPointer = () => {
      // Any tap/drag on the menu resets the idle window once armed
      if (!armed || cancelled) return;
      clearTimer();
      timer = window.setTimeout(() => {
        if (cancelled || celebratingAlreadyNear()) return;
        scrollToCelebrating(true);
      }, MENU_TO_CELEBRATING_DELAY_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) arm();
      },
      { threshold: 0.45 }
    );
    observer.observe(menu);

    window.addEventListener("scroll", onScroll, { passive: true });
    menu.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      cancelled = true;
      clearTimer();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      menu.removeEventListener("pointerdown", onPointer);
    };
  }, [interactive, scrollToCelebrating]);

  // When the guest scrolls the menu into view, keep history in sync for Back
  useEffect(() => {
    if (!interactive) return;
    const menu = document.getElementById("countdown-nav");
    if (!menu) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        const step = readInviteStep();
        if (step === "invite") pushInviteStep("scroll");
      },
      { threshold: 0.45 }
    );
    observer.observe(menu);
    return () => observer.disconnect();
  }, [interactive]);

  useEffect(() => {
    if (!inviteActive) return;
    playMutedLoopVideo(phoneVideoRef.current);
    playMutedLoopVideo(deskVideoRef.current);
  }, [inviteActive, isDesktop]);

  const closeAllOverlays = useCallback(() => {
    stopOurStoryAudio();
    setOurStoryOpen(false);
    setWeddingEventsOpen(false);
    setOverlayRevealed(false);
  }, []);

  const restoreHomeAfterClose = useCallback(async () => {
    setOverlayRevealed(false);
    await waitMs(PAGE_FADE_IN_MS);
    closeAllOverlays();
    setHomeFadedOut(false);
    setNavigationLocked(false);
    navBusy.current = false;
  }, [closeAllOverlays]);

  const openDestination = useCallback((id: InviteNavDestination) => {
    if (id === "our-story") {
      kickOurStoryAudio();
      flushSync(() => {
        setWeddingEventsOpen(false);
        setOverlayRevealed(false);
        setOurStoryOpen(true);
      });
      return;
    }

    if (id === "events") {
      flushSync(() => {
        setOurStoryOpen(false);
        setOverlayRevealed(false);
        setWeddingEventsOpen(true);
      });
    }
  }, []);

  /** Gesture-safe: start media / mount overlay invisible on press */
  const onNavPressStart = useCallback(
    (id: InviteNavDestination) => {
      if (navBusy.current || navigationLocked) return;
      if (id === "more-of-us") return;
      openDestination(id);
    },
    [navigationLocked, openDestination]
  );

  /** Finger/mouse cancelled before navigate — undo invisible mount */
  const onNavPressCancel = useCallback(() => {
    if (navBusy.current || homeFadedOut) return;
    closeAllOverlays();
  }, [closeAllOverlays, homeFadedOut]);

  /** After press hold — fade home out, fade destination in */
  const onNavNavigate = useCallback(async (id: InviteNavDestination) => {
    if (id === "more-of-us") return;
    if (id !== "our-story" && id !== "events") {
      return;
    }
    if (navBusy.current) return;
    navBusy.current = true;
    setNavigationLocked(true);
    setHomeFadedOut(true);

    pushDestinationStep(id);

    // Slight overlap: destination begins fading in as home fades out
    await waitMs(Math.round(PAGE_FADE_OUT_MS * 0.35));
    setOverlayRevealed(true);
    await waitMs(PAGE_FADE_IN_MS);

    // Stay locked while an overlay is open (prevents double-open)
    navBusy.current = false;
  }, []);

  const closeViaBack = useCallback(() => {
    const step = readInviteStep();
    if (step && isDestinationStep(step)) {
      history.back();
      return;
    }
    void restoreHomeAfterClose();
  }, [restoreHomeAfterClose]);

  useImperativeHandle(
    ref,
    () => ({
      resetToInviteTop: () => {
        closeAllOverlays();
        setHomeFadedOut(false);
        setNavigationLocked(false);
        navBusy.current = false;
        window.scrollTo(0, 0);
      },
      applyHistoryStep: (step: InviteHistoryStep) => {
        if (step === "invite") {
          void (async () => {
            await restoreHomeAfterClose();
            window.scrollTo({ top: 0, behavior: "smooth" });
          })();
          return;
        }

        if (step === "scroll") {
          void (async () => {
            await restoreHomeAfterClose();
            scrollToCountdown(true);
          })();
          return;
        }

        if (isDestinationStep(step)) {
          openDestination(step);
          setHomeFadedOut(true);
          setNavigationLocked(true);
          setOverlayRevealed(true);
          navBusy.current = false;
        }
      },
    }),
    [closeAllOverlays, openDestination, restoreHomeAfterClose, scrollToCountdown]
  );

  useEffect(() => {
    if (!ourStoryOpen && !weddingEventsOpen) {
      return;
    }
    document.documentElement.classList.add("is-scroll-locked");
    return () => {
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [ourStoryOpen, weddingEventsOpen]);

  return (
    <>
      <div
        id="home"
        className={`invite-scroller invite-page-fade ${homeFadedOut ? "is-faded-out" : ""}`}
        style={{
          backgroundColor: PAGE_CREAM,
          pointerEvents: interactive && !homeFadedOut ? "auto" : "none",
        }}
        data-page="landing2-invitation"
      >
        <section
          className="invite-hero"
          style={{ backgroundColor: PAGE_CREAM }}
          aria-label="Invitation"
        >
          {/*
            isolation: bells multiply against the invite PNG only.
          */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ isolation: "isolate", backgroundColor: PAGE_CREAM }}
            aria-hidden
          >
            {/* Phone invite + bells — landing2@2x.png + landing2a@2x.mp4 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANDING2_PHONE}
              alt=""
              className="cover-media art-phone"
              decoding="sync"
              fetchPriority="high"
              draggable={false}
            />
            <video
              ref={phoneVideoRef}
              src={LANDING2A_VIDEO}
              className="invite-loop-video invite-bells-layer cover-media art-phone"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              data-page="landing2-video"
            />
            {/* Desktop invite + bells — desklanding2@2x + desklanding2a */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANDING2_DESKTOP}
              alt=""
              className="cover-media art-desktop"
              decoding="sync"
              fetchPriority="high"
              draggable={false}
            />
            <video
              ref={deskVideoRef}
              src={LANDING2A_DESKTOP_VIDEO}
              className="invite-loop-video invite-bells-layer cover-media art-desktop"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              data-page="landing2-video"
            />
          </div>

          {interactive && (
            <button
              type="button"
              onClick={goToCountdown}
              className="absolute inset-0 z-[2] cursor-pointer border-0 bg-transparent"
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "pan-y",
              }}
              aria-label="Continue to countdown and menu"
            />
          )}
        </section>

        <PostRevealNav
          reveal={revealed}
          navigationLocked={navigationLocked}
          onPressStart={onNavPressStart}
          onPressCancel={onNavPressCancel}
          onNavigate={onNavNavigate}
          onContinue={interactive ? goToCelebrating : undefined}
        />

        <CelebratingTogetherSection />
      </div>

      <OurStoryScroll
        open={ourStoryOpen}
        revealed={overlayRevealed}
        onClose={closeViaBack}
      />
      <WeddingEvents
        open={weddingEventsOpen}
        revealed={overlayRevealed}
        onClose={closeViaBack}
      />
    </>
  );
});
