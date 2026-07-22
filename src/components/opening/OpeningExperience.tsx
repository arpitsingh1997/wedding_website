"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BowScreen } from "./BowScreen";
import {
  pushInviteStep,
  readInviteStep,
  replaceInviteStep,
  type InviteHistoryStep,
} from "./invite-history";
import { PAGE_CREAM } from "./page-cream";
import { ThirdPage, type ThirdPageHandle } from "./ThirdPage";
import { ViewportModeSync } from "./ViewportModeSync";
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
  const step = readInviteStep() ?? "bow";
  replaceInviteStep(step);
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function OpeningExperience() {
  const [phase, setPhase] = useState<Phase>("closed");
  const thirdPageRef = useRef<ThirdPageHandle>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const startUnwrap = useCallback(() => {
    setPhase("unwrapping");
  }, []);

  const finishUnwrap = useCallback(() => {
    resetInviteEntry();
    setPhase("story");
    pushInviteStep("invite");
  }, []);

  const showBow = phase === "closed" || phase === "unwrapping";

  const applyHistoryStep = useCallback((step: InviteHistoryStep) => {
    if (step === "bow") {
      thirdPageRef.current?.resetToInviteTop();
      setPhase("closed");
      window.scrollTo(0, 0);
      return;
    }

    // Any step past the bow: ensure the envelope is gone
    if (phaseRef.current !== "story") {
      setPhase("story");
    }
    thirdPageRef.current?.applyHistoryStep(step);
  }, []);

  useEffect(() => {
    replaceInviteStep("bow");
    resetInviteEntry();

    const onPopState = (event: PopStateEvent) => {
      const step = readInviteStep(event.state) ?? "bow";
      applyHistoryStep(step);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      // Back/forward cache can restore mid-scroll or open phase — force a clean entry
      if (event.persisted) {
        window.location.reload();
        return;
      }
      resetInviteEntry();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [applyHistoryStep]);

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
      <ViewportModeSync />
      {/* Invite always mounted + active under the bow so it peeks as flaps open */}
      <ThirdPage
        ref={thirdPageRef}
        inviteActive
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
