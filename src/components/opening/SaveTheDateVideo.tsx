"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  kickSaveTheDateAudio,
  stopSaveTheDateAudio,
} from "./save-the-date-audio";
import { useInviteOverlayFade } from "./use-invite-overlay-fade";
import { SAVE_THE_DATE_VIDEO } from "./welcome-assets";

type SaveTheDateVideoProps = {
  open: boolean;
  revealed?: boolean;
  onClose: () => void;
};

/** How long native controls stay after a tap / interaction */
const CONTROLS_VISIBLE_MS = 10_000;
/** Ignore the opening nav gesture so controls don't flash on first paint */
const OPEN_GESTURE_GUARD_MS = 500;

export function SaveTheDateVideo({
  open,
  revealed = true,
  onClose,
}: SaveTheDateVideoProps) {
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);
  const ignoreTapUntil = useRef(0);
  const controlsWereRevealed = useRef(false);
  const { rendered, fadeStyle } = useInviteOverlayFade(open, revealed);

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
    }, CONTROLS_VISIBLE_MS);
  }, [clearHideTimer]);

  /** Video is muted — soundtrack plays via Web Audio GainNode. */
  const ensurePlaying = useCallback(() => {
    if (!open) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    el.playsInline = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    if (!controlsWereRevealed.current) {
      el.controls = false;
    }
    if (el.paused) {
      void el.play().catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      clearHideTimer();
      setShowControls(false);
      controlsWereRevealed.current = false;
      stopSaveTheDateAudio();
      const el = videoRef.current;
      if (el) {
        el.controls = false;
        el.pause();
        try {
          el.currentTime = 0;
        } catch {
          // ignore
        }
      }
      return;
    }

    document.documentElement.classList.add("is-scroll-locked");
    setShowControls(false);
    controlsWereRevealed.current = false;
    ignoreTapUntil.current = performance.now() + OPEN_GESTURE_GUARD_MS;
    ensurePlaying();
    kickSaveTheDateAudio();

    return () => {
      clearHideTimer();
      document.documentElement.classList.remove("is-scroll-locked");
      // Don't stop audio here — Strict Mode remount would silence it.
      videoRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only when `open` changes
  }, [open]);

  const bumpControlsTimer = useCallback(() => {
    if (!controlsWereRevealed.current) return;
    setShowControls(true);
    const el = videoRef.current;
    if (el) el.controls = true;
    scheduleHideControls();
  }, [scheduleHideControls]);

  const onVideoTap = useCallback(() => {
    if (performance.now() < ignoreTapUntil.current) return;
    controlsWereRevealed.current = true;
    setShowControls(true);
    const el = videoRef.current;
    if (el) el.controls = true;
    scheduleHideControls();
  }, [scheduleHideControls]);

  if (typeof document === "undefined" || !rendered) return null;

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
        key="save-the-date-muted-web-audio"
        ref={videoRef}
        src={SAVE_THE_DATE_VIDEO}
        className="max-h-[82vh] max-h-[82dvh] w-full max-w-4xl rounded-sm object-contain"
        controls={showControls}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        muted
        preload="auto"
        onLoadedData={ensurePlaying}
        onCanPlay={ensurePlaying}
        onLoadedMetadata={ensurePlaying}
        onClick={onVideoTap}
        onPointerUp={onVideoTap}
        onPlay={bumpControlsTimer}
        onPause={bumpControlsTimer}
        onSeeking={bumpControlsTimer}
        data-video="save-the-date"
      />
    </div>,
    document.body
  );
}
