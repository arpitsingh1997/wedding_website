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

export function OpeningExperience() {
  const [phase, setPhase] = useState<Phase>("closed");

  const startUnwrap = useCallback(() => {
    setPhase("unwrapping");
  }, []);

  const finishUnwrap = useCallback(() => {
    setPhase("story");
  }, []);

  const showBow = phase === "closed" || phase === "unwrapping";

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
