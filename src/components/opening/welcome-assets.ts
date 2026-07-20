export const BUILD = "desklanding3-20260719t";

/** Phone invite — base art (Desktop landing2@2x.png) */
export const LANDING2_PHONE = `/images/landing2@2x.png?${BUILD}`;

/** Phone invite — bells overlay (Desktop landing2a@2x.mp4), white plate + multiply */
export const LANDING2A_VIDEO = `/images/landing2a@2x.mp4?${BUILD}`;

/** @deprecated alias */
export const LANDING2_POSTER = LANDING2_PHONE;

/** Invitation screen — desktop static art */
export const LANDING2_DESKTOP = `/images/desklanding2@2x.png?${BUILD}`;

/** Desktop invite — bells overlay (desklanding2a@2x.mp4), white plate + multiply */
export const LANDING2A_DESKTOP_VIDEO = `/images/desklanding2a@2x.mp4?${BUILD}`;

/** Scroll-down page — phone countdown + vertical nav artwork */
export const LANDING3_SCROLL = `/images/landing3@2x.png?${BUILD}`;

/** Scroll-down page — desktop countdown + 2×2 nav artwork */
export const LANDING3_DESKTOP = `/images/desklanding3@2x.png?${BUILD}`;

/** Our Story — Mac: single seamless scroll (Desktop “our story/desktop.png”) */
export const OUR_STORY_DESKTOP = `/images/our-story-scroll/desktop.png?${BUILD}`;

/** Our Story — phone: five-panel seamless scroll (Desktop “our story” folder) */
export const OUR_STORY_SCROLL_PAGES = [
  `/images/our-story-scroll/page-1.png?${BUILD}`,
  `/images/our-story-scroll/page-2.png?${BUILD}`,
  `/images/our-story-scroll/page-3.png?${BUILD}`,
  `/images/our-story-scroll/page-4.png?${BUILD}`,
  `/images/our-story-scroll/page-5.png?${BUILD}`,
] as const;

/** Our Story — phone HTML rebuild: photos extracted from panel artwork */
export const OUR_STORY_PHOTOS = {
  p1: [
    `/images/our-story/p1-1.jpg?${BUILD}`,
    `/images/our-story/p1-2.jpg?${BUILD}`,
    `/images/our-story/p1-3.jpg?${BUILD}`,
  ],
  p2: [`/images/our-story/p2-1.jpg?${BUILD}`, `/images/our-story/p2-2.jpg?${BUILD}`],
  p3: [`/images/our-story/p3-1.jpg?${BUILD}`, `/images/our-story/p3-2.jpg?${BUILD}`],
  p4: [
    `/images/our-story/p4-1.jpg?${BUILD}`,
    `/images/our-story/p4-2.jpg?${BUILD}`,
    `/images/our-story/p4-3.jpg?${BUILD}`,
    `/images/our-story/p4-4.jpg?${BUILD}`,
  ],
  footer: `/images/our-story/p4-footer.png?${BUILD}`,
} as const;

/** Panel 4 (Arpit & Dharmi) — keep original full artwork for exact font rendering */
export const OUR_STORY_PANEL4_IMAGE = `/images/our-story-4.png?${BUILD}`;

/** Save the Date nav video — with sound, native controls */
export const SAVE_THE_DATE_VIDEO = `/images/save-the-date.mp4?${BUILD}`;
