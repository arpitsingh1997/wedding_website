/** One shared AudioContext for bow / Our Story / Save the Date (iPhone unlock). */

let sharedCtx: AudioContext | null = null;

export function getInviteAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is browser-only");
  }
  if (!sharedCtx || sharedCtx.state === "closed") {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    sharedCtx = new Ctor();
  }
  return sharedCtx;
}

export function resumeInviteAudioContext(): Promise<void> {
  try {
    const ctx = getInviteAudioContext();
    if (ctx.state === "suspended") {
      return ctx.resume().then(() => undefined);
    }
  } catch {
    // ignore
  }
  return Promise.resolve();
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
