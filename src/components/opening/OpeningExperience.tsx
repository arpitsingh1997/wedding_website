"use client";

import { useCallback, useEffect, useState } from "react";
import { BowScreen } from "./BowScreen";
import { PAGE_CREAM } from "./page-cream";
import { ThirdPage } from "./ThirdPage";
import { VisualViewportSync } from "./VisualViewportSync";

type Phase = "closed" | "unwrapping" | "story";

function setScrollLocked(locked: boolean) {
  document.documentElement.classList.toggle("is-scroll-locked", locked);
}

/** Always start at the bow + top of invite — never restore old scroll. */
function resetInviteEntry() {
  if (typeof window === "undefined") return;
  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  } catch {
    // ignore
  }
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function OpeningExperience() {
  const [phase, setPhase] = useState<Phase>("closed");

  const startUnwrap = useCallback(() => {
    setPhase("unwrapping");
  }, []);

  const finishUnwrap = useCallback(() => {
    // Land on invite top after the bow, not wherever they left off last visit
    resetInviteEntry();
    setPhase("story");
  }, []);

  const showBow = phase === "closed" || phase === "unwrapping";

  useEffect(() => {
    resetInviteEntry();

    const onPageShow = (event: PageTransitionEvent) => {
      // Back/forward cache can restore mid-scroll or open phase — force a clean entry
      if (event.persisted) {
        window.location.reload();
        return;
      }
      resetInviteEntry();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Lock page scroll while the bow covers the invite; unlock afterward so Chrome can hide chrome on scroll
  useEffect(() => {
    setScrollLocked(showBow);
    if (!showBow) {
      window.scrollTo(0, 0);
    }
    return () => setScrollLocked(false);
  }, [showBow]);

  return (
    <div
      className="relative w-full"
      style={{
        backgroundColor: PAGE_CREAM,
        minHeight: "var(--app-height, 100dvh)",
      }}
      data-opening-phase={phase}
    >
      <VisualViewportSync />
      {/* Always mounted under the bow so the invite video is painted before flaps open */}
      <ThirdPage
        inviteActive={phase === "unwrapping" || phase === "story"}
        interactive={phase === "story"}
      />
      {showBow && (
        <BowScreen
          isUnwrapping={phase === "unwrapping"}
          onUnwrap={startUnwrap}
          onUnwrapped={finishUnwrap}
        />
      )}
    </div>
  );
}
