"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { luxuryEase } from "@/lib/motion";
import { OurStoryScroll } from "./OurStoryScroll";
import { PostRevealNav } from "./PostRevealNav";
import { SaveTheDateVideo } from "./SaveTheDateVideo";
import { LANDING2_POSTER, LANDING2_VIDEO, LANDING3_SCROLL } from "./welcome-assets";

type ThirdPageProps = {
  /** Invite is visible (bow opening or fully open) — keep video playing */
  inviteActive?: boolean;
  /** Guest can tap/scroll the invite (bow fully gone) */
  interactive?: boolean;
};

/** Keep muted looping playback alive (Safari + Chrome). */
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

/** Invitation page — full-bleed video, then countdown + nav */
export function ThirdPage({
  inviteActive = true,
  interactive = true,
}: ThirdPageProps) {
  const [revealed, setRevealed] = useState(false);
  const [saveTheDateOpen, setSaveTheDateOpen] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLoopingInviteVideo(videoRef, true);

  // Preload countdown artwork so the second page doesn't pop in empty
  useEffect(() => {
    const img = new Image();
    img.src = LANDING3_SCROLL;
  }, []);

  const goToCountdown = useCallback(() => {
    const scroller = scrollerRef.current;
    const menu = document.getElementById("countdown-nav");
    if (!scroller || !menu) return;
    scroller.scrollTo({ top: menu.offsetTop, behavior: "smooth" });
  }, []);

  // Re-kick playback when the invite becomes visible under opening flaps
  useEffect(() => {
    if (!inviteActive) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => {});
  }, [inviteActive]);

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

  return (
    <>
      <div
        ref={scrollerRef}
        id="home"
        className="invite-scroller fixed inset-0 z-[99990] overflow-x-hidden overflow-y-auto bg-[#F3E9E6]"
        style={{
          width: "100vw",
          pointerEvents: interactive ? "auto" : "none",
          WebkitOverflowScrolling: "touch",
        }}
        data-page="landing2-invitation"
      >
        <section
          className="full-viewport relative w-full shrink-0 overflow-hidden bg-[#F3E9E6]"
          aria-label="Invitation video"
        >
          <div className="pointer-events-none absolute inset-0 bg-[#F3E9E6]" aria-hidden>
            {/* Poster sits under the video so unwrap never flashes blank */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANDING2_POSTER}
              alt=""
              className="full-viewport absolute left-1/2 top-1/2 w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
            <video
              ref={videoRef}
              src={LANDING2_VIDEO}
              poster={LANDING2_POSTER}
              className="invite-loop-video full-viewport absolute left-1/2 top-1/2 w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
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
                // Allow vertical scroll on Safari/Chrome; tap still clicks
                touchAction: "pan-y",
              }}
              aria-label="Continue to countdown and menu"
            />
          )}

          <motion.p
            className="pointer-events-none absolute inset-x-0 bottom-8 z-[1] text-center font-display text-[11px] font-light tracking-[0.35em] text-white/85 uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.35)] sm:bottom-10 sm:text-xs"
            initial={{ opacity: 0, y: 8 }}
            animate={revealed && inviteActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 1, delay: 0.35, ease: luxuryEase }}
            aria-hidden
          >
            Tap or scroll
          </motion.p>
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
