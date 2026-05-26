import type { OpeningPhase } from "@/components/opening/types";

export const PHASE_ORDER: OpeningPhase[] = [
  "closed",
  "bow",
  "ribbon",
  "flaps",
  "welcome",
  "story",
];

export function phaseAtOrPast(
  current: OpeningPhase,
  target: OpeningPhase
): boolean {
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(target);
}
