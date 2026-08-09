"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { armMutedLoopVideo, playMutedLoopVideo } from "./invite-video";
import { PAGE_CREAM } from "./page-cream";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import {
  CELEBRATING_TOGETHER,
  CELEBRATING_TOGETHER_BELLS,
  CELEBRATING_TOGETHER_BELLS_DESKTOP,
  CELEBRATING_TOGETHER_DESKTOP,
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
    el.load();
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

function BellsOverlayVideo({
  videoRef,
  src,
  open,
  ready,
  onReady,
  artClass,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  open: boolean;
  ready: boolean;
  onReady: () => void;
  artClass: string;
}) {
  return (
    <video
      ref={videoRef}
      key={open ? `${artClass}-open` : `${artClass}-closed`}
      src={src}
      className={`invite-loop-video invite-bells-layer cover-media celebrating-cover ${artClass}`}
      style={{
        opacity: ready ? 1 : 0,
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
        onReady();
      }}
      onCanPlay={() => {
        playMutedLoopVideo(videoRef.current);
        onReady();
      }}
    />
  );
}

/** Full-viewport Celebrating Together — base PNG + bells overlay (phone + desktop) */
export function CelebratingTogether({
  open,
  revealed = true,
  onClose,
}: CelebratingTogetherProps) {
  const [mounted, setMounted] = useState(false);
  const [phoneBellsReady, setPhoneBellsReady] = useState(false);
  const [deskBellsReady, setDeskBellsReady] = useState(false);
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const deskVideoRef = useRef<HTMLVideoElement>(null);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLoopingBellsVideo(phoneVideoRef, open);
  useLoopingBellsVideo(deskVideoRef, open);

  useEffect(() => {
    if (!open) {
      setPhoneBellsReady(false);
      setDeskBellsReady(false);
      return;
    }
    document.documentElement.classList.add("is-scroll-locked");

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        for (const el of [phoneVideoRef.current, deskVideoRef.current]) {
          if (!el) continue;
          try {
            el.currentTime = 0;
          } catch {
            // ignore seek before metadata
          }
          playMutedLoopVideo(el);
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.documentElement.classList.remove("is-scroll-locked");
      phoneVideoRef.current?.pause();
      deskVideoRef.current?.pause();
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
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 z-[100030] flex h-11 w-11 items-center justify-center rounded-full font-display text-2xl leading-none lg:right-5"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          color: "#5C1A1A",
          backgroundColor: PAGE_CREAM,
          opacity: 1,
          isolation: "isolate",
          mixBlendMode: "normal",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Close celebrating together"
      >
        ×
      </button>

      {/*
        object-cover: edge-to-edge fill (no cream side gutters).
        isolation: bells multiply against the PNG only (iOS).
        Mobile: celebrating-together@2x.png + celebrating-together-bells.
        Desktop: desk celebrating together + desk celebrating bells.
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
          className="cover-media celebrating-cover art-phone"
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CELEBRATING_TOGETHER_DESKTOP}
          alt=""
          className="cover-media celebrating-cover art-desktop"
          decoding="sync"
          fetchPriority="high"
          draggable={false}
        />
        <BellsOverlayVideo
          videoRef={phoneVideoRef}
          src={CELEBRATING_TOGETHER_BELLS}
          open={open}
          ready={phoneBellsReady}
          onReady={() => setPhoneBellsReady(true)}
          artClass="art-phone"
        />
        <BellsOverlayVideo
          videoRef={deskVideoRef}
          src={CELEBRATING_TOGETHER_BELLS_DESKTOP}
          open={open}
          ready={deskBellsReady}
          onReady={() => setDeskBellsReady(true)}
          artClass="art-desktop"
        />
      </div>

      <span className="sr-only">
        Celebrating together — Dharmi&apos;s family and Arpit&apos;s family
      </span>
    </div>,
    document.body
  );
}
