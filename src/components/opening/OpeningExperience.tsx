"use client";

import { useCallback, useState } from "react";
import { BowScreen } from "./BowScreen";
import { ThirdPage } from "./ThirdPage";

const BLUSH_IVORY = "#F3E9E6";

type Phase = "closed" | "unwrapping" | "story";

export function OpeningExperience() {
  const [phase, setPhase] = useState<Phase>("closed");

  const startUnwrap = useCallback(() => {
    setPhase("unwrapping");
  }, []);

  const finishUnwrap = useCallback(() => {
    setPhase("story");
  }, []);

  const showBow = phase === "closed" || phase === "unwrapping";

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: BLUSH_IVORY }}>
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
