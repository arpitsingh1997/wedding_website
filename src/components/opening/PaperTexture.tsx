"use client";

import { motion } from "framer-motion";

/** Subtle paper grain over ivory background */
export function PaperTexture() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.55] mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
      }}
      aria-hidden
    />
  );
}
