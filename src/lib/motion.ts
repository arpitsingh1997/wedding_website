/** Shared Framer Motion easing & variants for the opening experience */

export const luxuryEase = [0.22, 1, 0.36, 1] as const;
export const gentleEase = [0.45, 0, 0.15, 1] as const;
export const revealEase = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, delay, ease: luxuryEase },
  }),
};

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
};
