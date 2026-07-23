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

  /** Keep trying play while open — iPhone often needs more than one attempt. */
  const ensurePlaying = useCallback(() => {
    if (!open) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.defaultMuted = false;
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    // Never let playback helpers turn controls on
    if (!controlsWereRevealed.current) {
      el.controls = false;
    }
    if (el.paused) {
      void el.play().catch(() => {});
    }
  }, [open]);

  // Open / close only — never re-run when controls toggle
  useEffect(() => {
    if (!open) {
      clearHideTimer();
      setShowControls(false);
      controlsWereRevealed.current = false;
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

    return () => {
      clearHideTimer();
      document.documentElement.classList.remove("is-scroll-locked");
      videoRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only when `open` changes
  }, [open]);

  /** After the user has shown controls, keep the 10s window alive while they use them */
  const bumpControlsTimer = useCallback(() => {
    if (!controlsWereRevealed.current) return;
    setShowControls(true);
    const el = videoRef.current;
    if (el) el.controls = true;
    scheduleHideControls();
  }, [scheduleHideControls]);

  /** First intentional tap on the video — only then show controls */
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
        ref={videoRef}
        src={SAVE_THE_DATE_VIDEO}
        className="max-h-[82vh] max-h-[82dvh] w-full max-w-4xl rounded-sm object-contain"
        controls={showControls}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        preload="auto"
        onLoadedData={ensurePlaying}
        onCanPlay={ensurePlaying}
        onLoadedMetadata={ensurePlaying}
        onClick={onVideoTap}
        onPointerUp={onVideoTap}
        onPlay={bumpControlsTimer}
        onPause={bumpControlsTimer}
        onSeeking={bumpControlsTimer}
        onVolumeChange={bumpControlsTimer}
        data-video="save-the-date"
      />
    </div>,
    document.body
  );
}
