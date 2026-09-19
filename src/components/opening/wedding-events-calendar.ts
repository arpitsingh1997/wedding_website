/** Wedding Events → calendar (.ics) — fixed IST (Asia/Kolkata) wall times. */

export type WeddingCalendarEvent = {
  uid: string;
  title: string;
  /** Invite-only venue label (Poolside, Amer Ballroom, …) — notes only, not map geocode */
  venue: string;
  description: string;
  /** IST wall time: YYYYMMDDTHHMMSS (no Z — paired with Asia/Kolkata VTIMEZONE) */
  start: string;
  end: string;
};

/**
 * Hotel pin for Apple/Google Calendar.
 * Show only the title in LOCATION (underlined). Pin via geo coords — do not put the
 * street address in LOCATION (that prints the full address and can geocode next door).
 * Apple map works when LOCATION === X-TITLE and geo: is set (X-ADDRESS optional/omitted).
 */
const LE_MERIDIEN_JAIPUR = {
  title: "Le Meridien, Jaipur",
  /** Used for notes only — not LOCATION (keeps Calendar label short). */
  address: "Number 1, Riico, Kukas, Rajasthan 302028",
  /** OpenStreetMap node for Le Méridien Jaipur Resort & Spa */
  lat: 27.0320761,
  lon: 75.8885293,
} as const;

/** Ordered to match the Wedding Events gallery pages. All times are IST. */
export const WEDDING_CALENDAR_EVENTS: readonly WeddingCalendarEvent[] = [
  {
    uid: "haldi-2027-01-25-v5@dharmiandarpit",
    title: "Haldi — Dharmi & Arpit",
    venue: "Poolside",
    description:
      "Where love blossoms — Haldi, 12:30 pm onwards (India Standard Time).",
    start: "20270125T123000",
    end: "20270125T160000",
  },
  {
    uid: "sangeet-2027-01-25-v5@dharmiandarpit",
    title: "Sangeet — Dharmi & Arpit",
    venue: "Amer Ballroom",
    description:
      "Lights. Camera. Dance. — Sangeet, 7:30 pm onwards (India Standard Time).",
    start: "20270125T193000",
    end: "20270126T003000",
  },
  {
    uid: "mameru-2027-01-26-v5@dharmiandarpit",
    title: "Mameru — Dharmi & Arpit",
    venue: "Poolside",
    description:
      "Wrapped in blessings — Mameru, 10:30 am onwards (India Standard Time).",
    start: "20270126T103000",
    end: "20270126T130000",
  },
  {
    uid: "wedding-2027-01-26-v5@dharmiandarpit",
    title: "The Big Day — Dharmi & Arpit",
    venue: "Amer Lawn",
    description:
      "Woven in vows — Saafa Bandhi 2:30 pm, Baraat 4 pm, Baraat Swagat 5:30 pm, Varmala 6 pm, Pheras 7 pm onwards (India Standard Time).",
    start: "20270126T143000",
    end: "20270126T220000",
  },
  {
    uid: "cocktail-2027-01-26-v5@dharmiandarpit",
    title: "Cocktail — Dharmi & Arpit",
    venue: "Amer Ballroom",
    description:
      "A toast to forever — Cocktail, 10:30 pm onwards (India Standard Time).",
    start: "20270126T223000",
    end: "20270127T020000",
  },
] as const;

/** IST has no daylight saving — offset is always +05:30. */
const IST_VTIMEZONE_LINES = [
  "BEGIN:VTIMEZONE",
  "TZID:Asia/Kolkata",
  "X-LIC-LOCATION:Asia/Kolkata",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0530",
  "TZOFFSETTO:+0530",
  "TZNAME:IST",
  "DTSTART:19700101T000000",
  "END:STANDARD",
  "END:VTIMEZONE",
] as const;

function foldIcsLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatStamp(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

/**
 * Convert an IST wall-time stamp (YYYYMMDDTHHMMSS) to UTC Z.
 * IST = UTC+5:30 year-round (no daylight saving).
 */
function istWallToUtcZ(istLocal: string): string {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(istLocal);
  if (!match) return `${istLocal}Z`;
  const [, y, mo, d, h, mi, s] = match;
  const utcMs = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s)
  );
  // Subtract IST offset (+5:30)
  const date = new Date(utcMs - (5 * 60 + 30) * 60 * 1000);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yy}${mm}${dd}T${hh}${min}${ss}Z`;
}

/** Apple map pin — short label only; geo pins the hotel (no street in LOCATION). */
function leMeridienLocationLines(): string[] {
  const { title, lat, lon } = LE_MERIDIEN_JAIPUR;
  // LOCATION === X-TITLE → underlined place name. Omit X-ADDRESS so Calendar
  // uses geo: coords instead of geocoding the street (which was one building off).
  const apple =
    `X-APPLE-STRUCTURED-LOCATION;VALUE=URI;` +
    `X-APPLE-RADIUS=50;` +
    `X-TITLE=${escapeIcsText(title)}:` +
    `geo:${lat},${lon}`;
  return [`LOCATION:${escapeIcsText(title)}`, apple];
}

export function buildWeddingEventsIcs(
  events: readonly WeddingCalendarEvent[] = WEDDING_CALENDAR_EVENTS
): string {
  const stamp = formatStamp();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dharmi & Arpit Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Intentionally no X-WR-CALNAME — that label makes some apps treat this as a feed/subscription
    "X-WR-TIMEZONE:Asia/Kolkata",
    ...IST_VTIMEZONE_LINES,
  ];

  for (const event of events) {
    // Emit UTC absolute times derived from IST wall clock so every calendar
    // app lands on the same India Standard Time moment.
    // No GEO property — Google Calendar often rejects imports that include it.
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      "SEQUENCE:1",
      `DTSTART:${istWallToUtcZ(event.start)}`,
      `DTEND:${istWallToUtcZ(event.end)}`,
      foldIcsLine(`SUMMARY:${escapeIcsText(event.title)}`),
      ...leMeridienLocationLines(),
      foldIcsLine(
        `DESCRIPTION:${escapeIcsText(`Venue: ${event.venue}. ${event.description}`)}`
      ),
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export const WEDDING_EVENTS_ICS_PATH = "/calendar/wedding-events.ics";

function isAndroidBrowser(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isPrivateHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

/** Force a real .ics download — Android Chrome won’t hand off inline calendar MIME. */
function downloadWeddingEventsIcsFile() {
  const ics = buildWeddingEventsIcs();
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "dharmi-arpit-wedding-events.ics";
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

/**
 * Android: Google Calendar can add a multi-event .ics from a public HTTPS URL.
 * Local/LAN preview falls back to downloading the file (Google can’t fetch private IPs).
 */
function addWeddingEventsOnAndroid() {
  const absoluteIcs = new URL(WEDDING_EVENTS_ICS_PATH, window.location.origin).href;
  const canGoogleFetch =
    window.location.protocol === "https:" &&
    !isPrivateHostname(window.location.hostname);

  if (canGoogleFetch) {
    // One-tap: open Google Calendar and offer to add all wedding events
    const googleUrl =
      "https://calendar.google.com/calendar/render?cid=" +
      encodeURIComponent(absoluteIcs);
    const opened = window.open(googleUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      // Popup blocked — fall back to an .ics download
      downloadWeddingEventsIcsFile();
    }
    return;
  }

  // LAN / http preview — download so the guest can Open with Calendar
  downloadWeddingEventsIcsFile();
}

/**
 * Open Calendar to add events once (METHOD:PUBLISH — not a subscription).
 * iPhone: hosted .ics popup (OS Calendar intercepts).
 * Android: Google Calendar URL (or .ics download on local preview).
 * Times are India Standard Time (Asia/Kolkata, UTC+05:30).
 */
export function addWeddingEventsToCalendar() {
  if (typeof window === "undefined") return;

  if (isAndroidBrowser()) {
    addWeddingEventsOnAndroid();
    return;
  }

  // Hosted .ics with inline calendar MIME — iOS Calendar intercepts as “Add events”
  // (not webcal:// subscription). Keep a handle so we can close the leftover tab.
  const icsUrl = `${WEDDING_EVENTS_ICS_PATH}?t=${Date.now()}`;
  const popup = window.open(icsUrl, "wedding-events-calendar");

  // Give Calendar time to hand off before closing the blank browser tab.
  const closeBlankTab = () => {
    try {
      popup?.close();
    } catch {
      // ignore
    }
    try {
      window.focus();
    } catch {
      // ignore
    }
  };

  window.setTimeout(closeBlankTab, 2500);
  window.setTimeout(closeBlankTab, 5000);
}
