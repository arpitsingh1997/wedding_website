"use client";

import { useEffect, useRef, type RefObject } from "react";
import { armMutedLoopVideo, playMutedLoopVideo } from "./invite-video";
import { PAGE_CREAM } from "./page-cream";
import {
  CELEBRATING_TOGETHER,
  CELEBRATING_TOGETHER_DESKTOP,
  LANDING2A_DESKTOP_VIDEO,
  LANDING2A_VIDEO,
} from "./welcome-assets";

/** Keep muted looping playback alive on iPhone Safari. */
function useLoopingBellsVideo(
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

/**
 * Celebrating Together — full-viewport scroll section below the menu
 * (phone + desktop art with landing2a / desklanding2a bells multiply overlay).
 */
export function CelebratingTogetherSection() {
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const deskVideoRef = useRef<HTMLVideoElement>(null);

  useLoopingBellsVideo(phoneVideoRef, true);
  useLoopingBellsVideo(deskVideoRef, true);

  return (
    <section
      id="celebrating-together"
      className="invite-hero"
      style={{ backgroundColor: PAGE_CREAM }}
      aria-label="Celebrating together"
      data-page="celebrating-together"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ isolation: "isolate", backgroundColor: PAGE_CREAM }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CELEBRATING_TOGETHER}
          alt=""
          className="cover-media celebrating-cover art-phone"
          decoding="async"
          fetchPriority="low"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CELEBRATING_TOGETHER_DESKTOP}
          alt=""
          className="cover-media celebrating-cover art-desktop"
          decoding="async"
          fetchPriority="low"
          draggable={false}
        />
        <video
          ref={phoneVideoRef}
          src={LANDING2A_VIDEO}
          className="invite-loop-video invite-bells-layer cover-media celebrating-cover art-phone"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          data-page="celebrating-together-bells"
        />
        <video
          ref={deskVideoRef}
          src={LANDING2A_DESKTOP_VIDEO}
          className="invite-loop-video invite-bells-layer cover-media celebrating-cover art-desktop"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          data-page="celebrating-together-bells"
        />
      </div>

      <span className="sr-only">
        Celebrating together — Dharmi&apos;s family and Arpit&apos;s family
      </span>
    </section>
  );
}
