export const BUILD = "manual-scroll-20260715g";

/** Invitation / story screen — full-bleed video (Mac + phone) */
export const LANDING2_VIDEO = `/images/landing2@2x.mp4?${BUILD}`;

/** Still frame while invite video buffers (avoids blank under the bow) */
export const LANDING2_POSTER = `/images/landing2@2x.png?${BUILD}`;

/** Scroll-down page — countdown + vertical nav artwork */
export const LANDING3_SCROLL = `/images/landing3@2x.png?${BUILD}`;

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
