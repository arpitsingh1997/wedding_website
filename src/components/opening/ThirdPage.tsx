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
import { CelebratingTogether } from "./CelebratingTogether";
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
import {
  armMutedLoopVideo,
  kickCelebratingBellsPlayback,
  kickSaveTheDatePlayback,
  playMutedLoopVideo,
} from "./invite-video";
import { OurStoryScroll } from "./OurStoryScroll";
import { PAGE_CREAM } from "./page-cream";
import { PostRevealNav, type InviteNavDestination } from "./PostRevealNav";
import { SaveTheDateVideo } from "./SaveTheDateVideo";
import {
  CELEBRATING_TOGETHER,
  CELEBRATING_TOGETHER_BELLS,
  CELEBRATING_TOGETHER_BELLS_DESKTOP,
  CELEBRATING_TOGETHER_DESKTOP,
  LANDING2_DESKTOP,
  LANDING2_PHONE,
  LANDING2A_DESKTOP_VIDEO,
  LANDING2A_VIDEO,
  LANDING3_DESKTOP,
  LANDING3_SCROLL,
  SAVE_THE_DATE_VIDEO,
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

const AUTO_SCROLL_DELAY_MS = 30_000;

/** Invitation page — phone PNG + video layer / desktop art, then countdown + nav */
export const ThirdPage = forwardRef<ThirdPageHandle, ThirdPageProps>(
  function ThirdPage(
    { inviteActive = true, interactive = true },
    ref
  ) {
  const [revealed, setRevealed] = useState(false);
  const [saveTheDateOpen, setSaveTheDateOpen] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);
  const [celebratingTogetherOpen, setCelebratingTogetherOpen] = useState(false);
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
    // Warm Celebrating Together bells so that overlay doesn’t flash soft/white
    const bells = document.createElement("video");
    bells.muted = true;
    bells.preload = "auto";
    bells.playsInline = true;
    bells.src = CELEBRATING_TOGETHER_BELLS;
    const deskBells = document.createElement("video");
    deskBells.muted = true;
    deskBells.preload = "auto";
    deskBells.playsInline = true;
    deskBells.src = CELEBRATING_TOGETHER_BELLS_DESKTOP;
    // Warm Our Story clip so tap → sound is immediate
    preloadOurStoryAudio();
    // Warm Save the Date so the overlay can play on first tap
    const saveTheDate = document.createElement("video");
    saveTheDate.preload = "auto";
    saveTheDate.playsInline = true;
    saveTheDate.src = SAVE_THE_DATE_VIDEO;
  }, []);

  const scrollToCountdown = useCallback((smooth = true) => {
    const menu = document.getElementById("countdown-nav");
    if (!menu) return;
    const top = menu.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const goToCountdown = useCallback(() => {
    pushInviteStep("scroll");
    scrollToCountdown(true);
  }, [scrollToCountdown]);

  // If the guest stays on the invite, ease them to the countdown after a minute
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
    setSaveTheDateOpen(false);
    setCelebratingTogetherOpen(false);
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
        setSaveTheDateOpen(false);
        setCelebratingTogetherOpen(false);
        setOverlayRevealed(false);
        setOurStoryOpen(true);
      });
      return;
    }

    if (id === "save-the-date") {
      flushSync(() => {
        setOurStoryOpen(false);
        setCelebratingTogetherOpen(false);
        setOverlayRevealed(false);
        setSaveTheDateOpen(true);
      });
      // Same tap unlocks unmuted autoplay on iPhone
      kickSaveTheDatePlayback();
      return;
    }

    if (id === "celebrating-together") {
      flushSync(() => {
        setOurStoryOpen(false);
        setSaveTheDateOpen(false);
        setOverlayRevealed(false);
        setCelebratingTogetherOpen(true);
      });
      kickCelebratingBellsPlayback();
    }
  }, []);

  /** Gesture-safe: start media / mount overlay invisible on press */
  const onNavPressStart = useCallback(
    (id: InviteNavDestination) => {
      if (navBusy.current || navigationLocked) return;
      if (id === "more-of-us" || id === "events") return;
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
    if (id === "more-of-us" || id === "events") return;
    if (
      id !== "our-story" &&
      id !== "save-the-date" &&
      id !== "celebrating-together"
    ) {
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
    if (!ourStoryOpen && !saveTheDateOpen && !celebratingTogetherOpen) return;
    document.documentElement.classList.add("is-scroll-locked");
    return () => {
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [ourStoryOpen, saveTheDateOpen, celebratingTogetherOpen]);

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
            isolation: bells multiply against the invite PNG only (same as desktop /
            Celebrating Together).
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
        />
      </div>

      <OurStoryScroll
        open={ourStoryOpen}
        revealed={overlayRevealed}
        onClose={closeViaBack}
      />
      <SaveTheDateVideo
        open={saveTheDateOpen}
        revealed={overlayRevealed}
        onClose={closeViaBack}
      />
      <CelebratingTogether
        open={celebratingTogetherOpen}
        revealed={overlayRevealed}
        onClose={closeViaBack}
      />
    </>
  );
});
