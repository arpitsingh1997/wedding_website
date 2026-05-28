export const BUILD = "page3-artwork-refresh-20260525-2312";

/** Phone second page — video */
export const LANDING3_MOBILE = `/images/landing3-mobile.mp4?${BUILD}`;

/** Mac second page — video */
export const LANDING4_DESKTOP = `/images/landing4-desktop.mp4?${BUILD}`;

/** Phone page 3 — custom ChatGPT phone artwork from Desktop */
export const LANDING5_MOBILE = `/images/chatgpt-phone.png?${BUILD}`;

/** Mac page 3 — full invitation artwork */
export const LANDING6_DESKTOP = `/images/landing6@2x.png?${BUILD}`;

/** Our Story — Mac: single full-bleed scroll */
export const OUR_STORY_IMAGE = `/images/landing7@2x.png?${BUILD}`;

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
