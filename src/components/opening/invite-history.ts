/** Browser history steps for the invite flow (back button). */

export type InviteHistoryStep =
  | "bow"
  | "invite"
  | "scroll"
  | "our-story"
  | "save-the-date"
  | "celebrating-together";

const MARKER = "wedding-invite-v1";

type InviteHistoryState = {
  m: typeof MARKER;
  step: InviteHistoryStep;
};

function cleanPath() {
  return window.location.pathname + window.location.search;
}

export function isInviteHistoryState(state: unknown): state is InviteHistoryState {
  return (
    !!state &&
    typeof state === "object" &&
    (state as InviteHistoryState).m === MARKER &&
    typeof (state as InviteHistoryState).step === "string"
  );
}

export function readInviteStep(
  state: unknown = typeof history !== "undefined" ? history.state : null
): InviteHistoryStep | null {
  return isInviteHistoryState(state) ? state.step : null;
}

export function replaceInviteStep(step: InviteHistoryStep) {
  history.replaceState({ m: MARKER, step } satisfies InviteHistoryState, "", cleanPath());
}

export function pushInviteStep(step: InviteHistoryStep) {
  if (readInviteStep() === step) return;
  history.pushState({ m: MARKER, step } satisfies InviteHistoryState, "", cleanPath());
}

export function isDestinationStep(step: InviteHistoryStep): boolean {
  return (
    step === "our-story" ||
    step === "save-the-date" ||
    step === "celebrating-together"
  );
}

/** Ensure scroll is under the destination so Back lands on the menu page. */
export function pushDestinationStep(
  step: "our-story" | "save-the-date" | "celebrating-together"
) {
  const current = readInviteStep();
  if (current !== "scroll" && !isDestinationStep(current ?? "bow")) {
    pushInviteStep("scroll");
  }
  pushInviteStep(step);
}
