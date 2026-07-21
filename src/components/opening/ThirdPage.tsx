"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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
  armMutedLoopVideo,
  kickCelebratingBellsPlayback,
  playMutedLoopVideo,
} from "./invite-video";
import { OurStoryScroll } from "./OurStoryScroll";
import { PAGE_CREAM } from "./page-cream";
import { PostRevealNav, type InviteNavDestination } from "./PostRevealNav";
import { SaveTheDateVideo } from "./SaveTheDateVideo";
import {
  CELEBRATING_TOGETHER,
  CELEBRATING_TOGETHER_BELLS,
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

const AUTO_SCROLL_DELAY_MS = 60_000;

/** Invitation page — phone PNG + video layer / desktop art, then countdown + nav */
export function ThirdPage({
  inviteActive = true,
  interactive = true,
}: ThirdPageProps) {
  const [revealed, setRevealed] = useState(false);
  const [saveTheDateOpen, setSaveTheDateOpen] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);
  const [celebratingTogetherOpen, setCelebratingTogetherOpen] = useState(false);
  /** Soft fade-in for overlays (invitation page-turn) */
  const [overlayRevealed, setOverlayRevealed] = useState(false);
  /** Fade the invite/scroll surface out while opening a destination */
  const [homeFadedOut, setHomeFadedOut] = useState(false);
  const [navigationLocked, setNavigationLocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDesktop = useIsDesktop();
  const navBusy = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLoopingInviteVideo(videoRef, true);

  // Keep invite bells on the correct phone/desktop file after layout resolves
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const next = isDesktop ? LANDING2A_DESKTOP_VIDEO : LANDING2A_VIDEO;
    const marker = isDesktop ? "desklanding2a" : "landing2a@2x";
    if (el.src.includes(marker)) return;
    el.src = next;
    el.load();
    playMutedLoopVideo(el);
  }, [isDesktop]);

  useEffect(() => {
    const img = new Image();
    img.src = isDesktop ? LANDING3_DESKTOP : LANDING3_SCROLL;
    // Prefetch both invite frames so desktop never waits on bow open
    const invitePhone = new Image();
    invitePhone.src = LANDING2_PHONE;
    const inviteDesk = new Image();
    inviteDesk.src = LANDING2_DESKTOP;
    const celebrating = new Image();
    celebrating.src = CELEBRATING_TOGETHER;
    // Warm the bells decode so the multiply layer doesn’t flash soft/white
    const bells = document.createElement("video");
    bells.muted = true;
    bells.preload = "auto";
    bells.playsInline = true;
    bells.src = CELEBRATING_TOGETHER_BELLS;
    // Warm Our Story clip so tap → sound is immediate
    preloadOurStoryAudio();
    // Warm Save the Date so the overlay can play on first tap
    const saveTheDate = document.createElement("video");
    saveTheDate.preload = "auto";
    saveTheDate.playsInline = true;
    saveTheDate.src = SAVE_THE_DATE_VIDEO;
  }, [isDesktop]);

  const goToCountdown = useCallback(() => {
    const menu = document.getElementById("countdown-nav");
    if (!menu) return;
    const top = menu.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

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

  useEffect(() => {
    if (!inviteActive) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => {});
  }, [inviteActive, isDesktop]);

  const closeAllOverlays = useCallback(() => {
    stopOurStoryAudio();
    setOurStoryOpen(false);
    setSaveTheDateOpen(false);
    setCelebratingTogetherOpen(false);
    setOverlayRevealed(false);
  }, []);

  /** Gesture-safe: start media / mount overlay invisible on press */
  const onNavPressStart = useCallback(
    (id: InviteNavDestination) => {
      if (navBusy.current || navigationLocked) return;

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
    },
    [navigationLocked]
  );

  /** Finger/mouse cancelled before navigate — undo invisible mount */
  const onNavPressCancel = useCallback(() => {
    if (navBusy.current || homeFadedOut) return;
    closeAllOverlays();
  }, [closeAllOverlays, homeFadedOut]);

  /** After press hold — fade home out, fade destination in */
  const onNavNavigate = useCallback(async (id: InviteNavDestination) => {
    if (id === "more-of-us") return;
    if (navBusy.current) return;
    navBusy.current = true;
    setNavigationLocked(true);
    setHomeFadedOut(true);

    // Slight overlap: destination begins fading in as home fades out
    await waitMs(Math.round(PAGE_FADE_OUT_MS * 0.35));
    setOverlayRevealed(true);
    await waitMs(PAGE_FADE_IN_MS);

    // Stay locked while an overlay is open (prevents double-open)
    navBusy.current = false;
  }, []);

  const restoreHomeAfterClose = useCallback(async () => {
    // Fade destination out first, then unmount and restore the invite page
    setOverlayRevealed(false);
    await waitMs(PAGE_FADE_IN_MS);
    closeAllOverlays();
    setHomeFadedOut(false);
    setNavigationLocked(false);
    navBusy.current = false;
  }, [closeAllOverlays]);

  const closeOurStory = useCallback(() => {
    void restoreHomeAfterClose();
  }, [restoreHomeAfterClose]);

  const closeSaveTheDate = useCallback(() => {
    void restoreHomeAfterClose();
  }, [restoreHomeAfterClose]);

  const closeCelebratingTogether = useCallback(() => {
    void restoreHomeAfterClose();
  }, [restoreHomeAfterClose]);

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
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ backgroundColor: PAGE_CREAM }}
            aria-hidden
          >
            {/* Base invite art — phone vs desktop via <picture> (no JS flash) */}
            <picture>
              <source media="(min-width: 1024px)" srcSet={LANDING2_DESKTOP} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LANDING2_PHONE}
                alt=""
                className="cover-media"
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
            </picture>
            {/* Bells on white — multiply drops the white plate. Both sources; CSS picks one. */}
            <video
              ref={videoRef}
              src={isDesktop ? LANDING2A_DESKTOP_VIDEO : LANDING2A_VIDEO}
              className="invite-loop-video invite-bells-layer cover-media"
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
        onClose={closeOurStory}
      />
      <SaveTheDateVideo
        open={saveTheDateOpen}
        revealed={overlayRevealed}
        onClose={closeSaveTheDate}
      />
      <CelebratingTogether
        open={celebratingTogetherOpen}
        revealed={overlayRevealed}
        onClose={closeCelebratingTogether}
      />
    </>
  );
}
