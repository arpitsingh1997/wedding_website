"use client";

import { useCallback, useState } from "react";
import { BowScreen } from "./BowScreen";
import { SecondPage } from "./SecondPage";
import { ThirdPage } from "./ThirdPage";
import type { OpeningPhase } from "./types";

const BLUSH_IVORY = "#F3E9E6";

export function OpeningExperience() {
  const [phase, setPhase] = useState<OpeningPhase>("closed");
  const showBow = phase === "closed";
  const showWelcome = phase === "welcome";
  const showStory = phase === "story";

  const goToWelcome = useCallback(() => {
    setPhase("welcome");
  }, []);

  const handleAfterVideo = useCallback(() => {
    setPhase("story");
  }, []);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: BLUSH_IVORY }}>
      {showStory && <ThirdPage />}
      {showWelcome && <SecondPage onContinue={handleAfterVideo} />}
      {showBow && <BowScreen onContinue={goToWelcome} />}
    </div>
  );
}
