"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANDING } from "./landing-assets";

type BowScreenProps = {
  onContinue: () => void;
};

const BOW_HINT = "TAP BOW TO UNVEIL";

const tapButtonClass =
  "fixed left-0 right-0 z-[100000] m-0 w-full cursor-pointer border-0 bg-transparent p-0";

export function BowScreen({ onContinue }: BowScreenProps) {
  const [mounted, setMounted] = useState(false);
  const advanced = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTap = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    onContinue();
  }, [onContinue]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999]"
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundColor: "#F3E9E6",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LANDING}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        draggable={false}
        aria-hidden
      />

      {/* Top third — backup tap zone */}
      <button
        type="button"
        onPointerUp={handleTap}
        onClick={handleTap}
        className={tapButtonClass}
        style={{
          top: 0,
          height: "34dvh",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
        aria-label="Open invitation"
      />

      {/* Lower two-thirds — main tap zone */}
      <button
        type="button"
        onPointerUp={handleTap}
        onClick={handleTap}
        className={tapButtonClass}
        style={{
          top: "34dvh",
          height: "66dvh",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
        aria-label="Open invitation"
      />

      <p
        className="pointer-events-none absolute bottom-10 left-0 right-0 z-[100001] text-center font-display text-xs font-light tracking-[0.35em] text-[#5C4A42]/60 sm:text-sm"
        data-bow-hint="unveil-v2"
        style={{ textTransform: "uppercase" }}
      >
        {BOW_HINT}
      </p>
    </div>,
    document.body
  );
}
