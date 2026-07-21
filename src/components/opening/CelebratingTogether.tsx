"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { armMutedLoopVideo, playMutedLoopVideo } from "./invite-video";
import { PAGE_CREAM } from "./page-cream";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import {
  CELEBRATING_TOGETHER,
  CELEBRATING_TOGETHER_BELLS,
} from "./welcome-assets";

type CelebratingTogetherProps = {
  open: boolean;
  revealed?: boolean;
  onClose: () => void;
};

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

/** Full-viewport Celebrating Together — base PNG + bells, invitation fade */
export function CelebratingTogether({
  open,
  revealed = true,
  onClose,
}: CelebratingTogetherProps) {
  const [mounted, setMounted] = useState(false);
  const [bellsReady, setBellsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLoopingBellsVideo(videoRef, open);

  useEffect(() => {
    if (!open) {
      setBellsReady(false);
      return;
    }
    document.documentElement.classList.add("is-scroll-locked");

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = videoRef.current;
        if (!el) return;
        el.currentTime = 0;
        playMutedLoopVideo(el);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.documentElement.classList.remove("is-scroll-locked");
      videoRef.current?.pause();
    };
  }, [open]);

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      className="full-viewport z-[100020] select-none overflow-hidden"
      style={{
        backgroundColor: PAGE_CREAM,
        userSelect: "none",
        ...fadeStyle,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Celebrating together"
      id="celebrating-together"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 z-[100030] flex h-11 w-11 items-center justify-center rounded-full font-display text-2xl leading-none text-black shadow-md backdrop-blur-sm lg:right-5"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          backgroundColor: `${PAGE_CREAM}E6`,
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Close celebrating together"
      >
        ×
      </button>

      {/*
        object-cover: edge-to-edge fill (no cream side gutters).
        isolation: bells multiply against the PNG only (iOS).
      */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ isolation: "isolate", backgroundColor: PAGE_CREAM }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CELEBRATING_TOGETHER}
          alt=""
          className="cover-media celebrating-cover"
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />
        <video
          ref={videoRef}
          src={CELEBRATING_TOGETHER_BELLS}
          className="invite-loop-video invite-bells-layer cover-media celebrating-cover"
          style={{
            opacity: bellsReady ? 1 : 0,
            transition: "opacity 180ms ease-out",
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          data-page="celebrating-together-bells"
          onLoadedData={() => {
            playMutedLoopVideo(videoRef.current);
            setBellsReady(true);
          }}
          onCanPlay={() => setBellsReady(true)}
        />
      </div>

      <span className="sr-only">
        Celebrating together — Dharmi&apos;s family and Arpit&apos;s family
      </span>
    </div>,
    document.body
  );
}
