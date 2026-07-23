/**
 * Open Instagram without stranding guests on an Instagram Chrome tab.
 *
 * Mobile: briefly probe the Instagram app, then fall back to web if needed.
 * Desktop: open the web profile immediately (no app scheme).
 */
export function openInstagramProfile(username = "dharmiandarpit") {
  const webUrl = `https://www.instagram.com/${username}`;
  const appUrl = `instagram://user?username=${username}`;

  const openWeb = () => {
    const tab = window.open(webUrl, "_blank");
    if (!tab) {
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
  };

  // Desktop / trackpad: no Instagram app — skip the probe delay
  const likelyHasApp =
    typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches ||
      document.documentElement.classList.contains("is-phone"));

  if (!likelyHasApp) {
    openWeb();
    return;
  }

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

    openWeb();
  }, 180);
}
