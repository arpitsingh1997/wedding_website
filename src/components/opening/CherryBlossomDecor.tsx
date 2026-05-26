"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { luxuryEase } from "@/lib/motion";

const REF = "/cherry-blossom-reference.png";

/** Corner blossoms (above panels) + floating petals */
export function CherryBlossomDecor() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        startX: 62 + (i % 6) * 5,
        startY: 6 + (i % 4) * 3,
        size: 9 + (i % 4) * 3,
        delay: i * 1.1,
        duration: 13 + (i % 5) * 2.5,
        drift: (i % 2 === 0 ? -1 : 1) * (14 + i * 5),
      })),
    []
  );

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[25] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: luxuryEase }}
      aria-hidden
    >
      {/* Top-right blossom cluster */}
      <motion.div className="absolute -right-[6%] -top-[4%] h-[min(58vh,520px)] w-[min(58vw,580px)] overflow-hidden">
        <Image
          src={REF}
          alt=""
          width={900}
          height={1350}
          priority
          className="absolute max-w-none"
          style={{
            width: "165%",
            height: "auto",
            right: 0,
            top: 0,
          }}
        />
      </motion.div>

      {/* Bottom-left blossom cluster */}
      <motion.div className="absolute -bottom-[6%] -left-[4%] h-[min(55vh,500px)] w-[min(56vw,560px)] overflow-hidden">
        <Image
          src={REF}
          alt=""
          width={900}
          height={1350}
          className="absolute max-w-none"
          style={{
            width: "165%",
            height: "auto",
            left: 0,
            bottom: 0,
          }}
        />
      </motion.div>

      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute z-10"
          style={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            width: p.size,
            height: p.size * 0.85,
          }}
          initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
          animate={{
            opacity: [0, 0.85, 0.85, 0],
            y: [0, 45, 100, 150],
            x: [0, p.drift * 0.5, p.drift],
            rotate: [0, 120, 240],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 16 14" fill="none" className="h-full w-full">
            <ellipse cx="8" cy="7" rx="4" ry="5" fill="#E8A8B0" fillOpacity="0.95" />
            <ellipse cx="6" cy="8" rx="3" ry="4" fill="#F0C4C8" fillOpacity="0.8" />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  );
}
