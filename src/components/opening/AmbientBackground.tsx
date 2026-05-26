"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8 }}
      aria-hidden
    >
      {/* Base ivory */}
      <motion.div
        className="absolute inset-0 bg-ivory"
        animate={{ opacity: [1, 0.97, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Watercolor washes */}
      <motion.div
        className="watercolor-wash absolute inset-0"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [1, 1, 0.95],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft blush orb — upper left */}
      <motion.div
        className="absolute -left-[10%] -top-[5%] h-[55vh] w-[55vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232, 212, 208, 0.35) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 12, 0], y: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Muted gold orb — lower right */}
      <motion.div
        className="absolute -bottom-[8%] -right-[5%] h-[50vh] w-[50vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(196, 165, 116, 0.15) 0%, transparent 68%)",
        }}
        animate={{ x: [0, -10, 0], y: [0, -6, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Gentle shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255, 252, 248, 0.12) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          backgroundPosition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Fine grain texture */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        animate={{ opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
