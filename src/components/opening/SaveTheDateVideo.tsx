"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import { SAVE_THE_DATE_VIDEO } from "./welcome-assets";

type SaveTheDateVideoProps = {
  open: boolean;
  revealed?: boolean;
  onClose: () => void;
};

const CONTROLS_HIDE_MS = 500;

export function SaveTheDateVideo({
  open,
  revealed = true,
  onClose,
}: SaveTheDateVideoProps) {
  const [mounted, setMounted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => {
      setShowControls(false);
      const el = videoRef.current;
      if (el) el.controls = false;
      hideTimer.current = null;
    }, CONTROLS_HIDE_MS);
  }, [clearHideTimer]);

  const playVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.muted = false;
    void el.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) {
      clearHideTimer();
      setShowControls(true);
      return;
    }

    document.documentElement.classList.add("is-scroll-locked");
    setShowControls(true);
    const frame = requestAnimationFrame(() => {
      playVideo();
      scheduleHideControls();
    });

    return () => {
      cancelAnimationFrame(frame);
      clearHideTimer();
      document.documentElement.classList.remove("is-scroll-locked");
      videoRef.current?.pause();
    };
  }, [open, playVideo, scheduleHideControls, clearHideTimer]);

  const revealControlsBriefly = useCallback(() => {
    setShowControls(true);
    const el = videoRef.current;
    if (el) el.controls = true;
    scheduleHideControls();
  }, [scheduleHideControls]);

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      className="full-viewport z-[100020] flex items-center justify-center bg-black/90 p-4 sm:p-8"
      style={fadeStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Save the date video"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 font-display text-2xl leading-none text-white"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="Close video"
      >
        ×
      </button>

      <video
        ref={videoRef}
        src={SAVE_THE_DATE_VIDEO}
        className="max-h-[82vh] max-h-[82dvh] w-full max-w-4xl rounded-sm object-contain"
        controls={showControls}
        playsInline
        preload="auto"
        onLoadedData={playVideo}
        onClick={revealControlsBriefly}
        data-video="save-the-date"
      />
    </div>,
    document.body
  );
}
