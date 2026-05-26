"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SAVE_THE_DATE_VIDEO } from "./welcome-assets";

type SaveTheDateVideoProps = {
  open: boolean;
  onClose: () => void;
};

export function SaveTheDateVideo({ open, onClose }: SaveTheDateVideoProps) {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const playVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.muted = false;
    void el.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => playVideo());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      videoRef.current?.pause();
    };
  }, [open, playVideo]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100020] flex items-center justify-center bg-black/90 p-4 sm:p-8"
      style={{ width: "100vw", height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label="Save the date video"
    >
      <button
        type="button"
        onClick={onClose}
        onPointerUp={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 font-display text-2xl leading-none text-white"
        aria-label="Close video"
      >
        ×
      </button>

      <video
        ref={videoRef}
        src={SAVE_THE_DATE_VIDEO}
        className="max-h-[82dvh] w-full max-w-4xl rounded-sm object-contain"
        controls
        playsInline
        preload="auto"
        onLoadedData={playVideo}
        data-video="save-the-date"
      />
    </div>,
    document.body
  );
}
