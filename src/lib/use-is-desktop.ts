"use client";

import { useEffect, useState } from "react";
import { DESKTOP_MIN_WIDTH } from "@/lib/viewport";

/** Client-only desktop check. Defaults false (mobile) so phone assets stay stable. */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}
