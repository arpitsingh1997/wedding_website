/**
 * Open Instagram without stranding guests on an Instagram Chrome tab.
 *
 * 1) Try the Instagram app (iframe — wedding page stays put).
 * 2) If the app opens, page goes background → do nothing else.
 * 3) If not, open the web profile in a tab we own, then close that tab
 *    once the app/universal-link handoff has had a moment — so returning
 *    to Chrome lands back on the wedding invite.
 */
export function openInstagramProfile(username = "dharmiandarpit") {
  const webUrl = `https://www.instagram.com/${username}`;
  const appUrl = `instagram://user?username=${username}`;

  let handedOff = false;
  const markHandOff = () => {
    if (document.visibilityState === "hidden") handedOff = true;
  };
  document.addEventListener("visibilitychange", markHandOff);
  window.addEventListener("pagehide", markHandOff);

  // Probe the native app without navigating this tab away
  const probe = document.createElement("iframe");
  probe.style.display = "none";
  probe.setAttribute("aria-hidden", "true");
  probe.src = appUrl;
  document.body.appendChild(probe);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", markHandOff);
    window.removeEventListener("pagehide", markHandOff);
    probe.remove();

    if (handedOff || document.visibilityState === "hidden") {
      // Instagram app opened — invite tab is still underneath
      return;
    }

    // No app (or desktop): open web. Keep the WindowProxy so we can close it.
    // Do NOT pass noopener — that returns null and leaves an orphan tab.
    const tab = window.open(webUrl, "_blank");
    if (!tab) {
      // Popup blocked — last resort same-tab (rare on mobile tap)
      window.location.assign(webUrl);
      return;
    }

    // After Chrome/iOS hand off to the Instagram app, close the leftover tab
    const tryClose = () => {
      try {
        tab.close();
      } catch {
        /* ignore */
      }
    };
    window.setTimeout(tryClose, 600);
    window.setTimeout(tryClose, 1600);
  }, 700);
}
