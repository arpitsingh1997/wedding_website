"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { LANDING3_MOBILE, LANDING4_DESKTOP } from "./welcome-assets";

type SecondPageProps = {
  onContinue: () => void;
};

const tapClass =
  "fixed left-0 right-0 z-[100000] m-0 w-full cursor-pointer border-0 bg-transparent p-0";

function useVideoPlayback(ref: RefObject<HTMLVideoElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const play = () => void el.play().catch(() => {});
    play();
    el.addEventListener("loadeddata", play);
    el.addEventListener("canplay", play);
    return () => {
      el.removeEventListener("loadeddata", play);
      el.removeEventListener("canplay", play);
    };
  }, [ref, enabled]);
}

export function SecondPage({ onContinue }: SecondPageProps) {
  const [mounted, setMounted] = useState(false);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useVideoPlayback(mobileVideoRef, mounted);
  useVideoPlayback(desktopVideoRef, mounted);

  const handleTap = useCallback(() => {
    onContinue();
  }, [onContinue]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-[#F4EFE6]"
      style={{ width: "100vw", height: "100dvh" }}
    >
      {/* Mac — landing4@2x.mp4, full artwork visible (not cropped) */}
      <div className="hidden h-full w-full lg:flex lg:items-center lg:justify-center">
        <video
          ref={desktopVideoRef}
          src={LANDING4_DESKTOP}
          className="pointer-events-none max-h-[100dvh] max-w-[100vw] object-contain"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          data-second-page="landing4-desktop"
          aria-hidden
        />
        <button
          type="button"
          onPointerUp={handleTap}
          onClick={handleTap}
          className="fixed inset-0 z-[100000] cursor-pointer border-0 bg-transparent"
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
          aria-label="Continue to final page"
        />
      </div>

      {/* Phone — landing3@2x.mp4 */}
      <div className="relative h-full w-full lg:hidden">
        <video
          ref={mobileVideoRef}
          src={LANDING3_MOBILE}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          data-second-page="landing3-mobile"
          aria-hidden
        />
        <button
          type="button"
          onPointerUp={handleTap}
          onClick={handleTap}
          className={tapClass}
          style={{
            top: 0,
            height: "34dvh",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          aria-label="Continue to invitation"
        />
        <button
          type="button"
          onPointerUp={handleTap}
          onClick={handleTap}
          className={tapClass}
          style={{
            top: "34dvh",
            height: "66dvh",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
          }}
          aria-label="Continue to invitation"
        />
      </div>
    </div>,
    document.body
  );
}
