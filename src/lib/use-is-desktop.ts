"use client";

import { useLayoutEffect, useState } from "react";
import { DESKTOP_MIN_WIDTH } from "@/lib/viewport";

/**
 * Client desktop check. Starts false for SSR/hydration match, then resolves
 * in useLayoutEffect (before paint) so desktop never flashes phone art.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const media = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}
