"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { OurStoryScroll } from "./OurStoryScroll";
import { PAGE_CREAM } from "./page-cream";
import { PostRevealNav } from "./PostRevealNav";
import { SaveTheDateVideo } from "./SaveTheDateVideo";
import {
  LANDING2_DESKTOP,
  LANDING2_PHONE,
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

/** Keep muted looping playback alive (Safari + Chrome). Phone only. */
function useLoopingInviteVideo(
  ref: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const arm = () => {
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      el.loop = true;
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
      el.controls = false;
    };

    const play = () => {
      arm();
      if (el.paused) void el.play().catch(() => {});
    };

    arm();
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

/** Invitation page — phone PNG + video layer / desktop art, then countdown + nav */
export function ThirdPage({
  inviteActive = true,
  interactive = true,
}: ThirdPageProps) {
  const [revealed, setRevealed] = useState(false);
  const [saveTheDateOpen, setSaveTheDateOpen] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLoopingInviteVideo(videoRef, !isDesktop);

  useEffect(() => {
    const img = new Image();
    img.src = isDesktop ? LANDING3_DESKTOP : LANDING3_SCROLL;
  }, [isDesktop]);

  const goToCountdown = useCallback(() => {
    const menu = document.getElementById("countdown-nav");
    if (!menu) return;
    const top = menu.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!inviteActive || isDesktop) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => {});
  }, [inviteActive, isDesktop]);

  const openOurStory = useCallback(() => {
    setSaveTheDateOpen(false);
    setOurStoryOpen(true);
  }, []);

  const closeOurStory = useCallback(() => {
    setOurStoryOpen(false);
  }, []);

  const openSaveTheDate = useCallback(() => {
    setOurStoryOpen(false);
    setSaveTheDateOpen(true);
  }, []);

  const closeSaveTheDate = useCallback(() => {
    setSaveTheDateOpen(false);
  }, []);

  useEffect(() => {
    if (!ourStoryOpen && !saveTheDateOpen) return;
    document.documentElement.classList.add("is-scroll-locked");
    return () => {
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [ourStoryOpen, saveTheDateOpen]);

  return (
    <>
      <div
        id="home"
        className="invite-scroller"
        style={{
          backgroundColor: PAGE_CREAM,
          pointerEvents: interactive ? "auto" : "none",
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
            {isDesktop ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={LANDING2_DESKTOP}
                alt=""
                className="cover-media"
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
            ) : (
              <>
                {/* Base: full invite */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LANDING2_PHONE}
                  alt=""
                  className="cover-media"
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                />
                {/* Layer: bells on white — multiply drops the white plate */}
                <video
                  ref={videoRef}
                  src={LANDING2A_VIDEO}
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
              </>
            )}
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
          onOurStoryClick={openOurStory}
          onSaveTheDateClick={openSaveTheDate}
        />
      </div>

      <OurStoryScroll open={ourStoryOpen} onClose={closeOurStory} />
      <SaveTheDateVideo open={saveTheDateOpen} onClose={closeSaveTheDate} />
    </>
  );
}
