"use client";

import { motion } from "framer-motion";
import { fadeUp, luxuryEase, staggerChildren } from "@/lib/motion";

type InvitationContentProps = {
  visible: boolean;
};

export function InvitationContent({ visible }: InvitationContentProps) {
  return (
    <motion.section
      className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-8 py-24 text-center sm:px-14"
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={staggerChildren}
      aria-label="Wedding invitation"
    >
      {/* Ornamental frame */}
      <div
        className="pointer-events-none absolute inset-6 rounded-sm border border-gold-muted/20 sm:inset-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-8 rounded-sm border border-gold-muted/10 sm:inset-12"
        aria-hidden
      />

      {/* Ornamental top line */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="mb-10 flex items-center gap-4"
      >
        <span className="h-px w-10 bg-gold-muted/35 sm:w-16" />
        <span className="font-display text-[10px] font-light tracking-[0.4em] text-gold-muted/90 uppercase">
          With hearts full of joy
        </span>
        <span className="h-px w-10 bg-gold-muted/35 sm:w-16" />
      </motion.div>

      {/* Host families */}
      <motion.p
        variants={fadeUp}
        custom={0.1}
        className="font-display text-lg font-light leading-relaxed text-ink-soft sm:text-xl"
      >
        <span className="block">Bharti & Akshay Desai</span>
        <span className="my-2 block text-sm font-normal tracking-[0.2em] text-ink-soft/60 uppercase">
          together with
        </span>
        <span className="block">Arti & Satendra Singh</span>
      </motion.p>

      <motion.p
        variants={fadeUp}
        custom={0.25}
        className="mt-8 max-w-md font-display text-sm font-light leading-relaxed tracking-wide text-ink-soft/80 sm:text-base"
      >
        joyfully invite you to celebrate the wedding of
      </motion.p>

      {/* Couple names — hero */}
      <motion.div variants={fadeUp} custom={0.45} className="mt-10">
        <h1 className="font-display text-5xl font-light tracking-wide text-ink-deep sm:text-6xl md:text-7xl">
          <span className="italic">Dharmi</span>
          <span className="mx-3 text-gold-muted/70 font-normal not-italic">&</span>
          <span className="italic">Arpit</span>
        </h1>
        <motion.div
          className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold-muted/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={visible ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.2, delay: 1.1, ease: luxuryEase }}
        />
      </motion.div>

      {/* Subtle footer ornament */}
      <motion.p
        variants={fadeUp}
        custom={0.65}
        className="mt-14 font-display text-xs font-light tracking-[0.3em] text-ink-soft/40 uppercase"
      >
        Your presence is our greatest gift
      </motion.p>
    </motion.section>
  );
}
