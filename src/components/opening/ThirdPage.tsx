"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { luxuryEase } from "@/lib/motion";
import { OurStoryScroll } from "./OurStoryScroll";
import { PostRevealNav } from "./PostRevealNav";
import { SaveTheDateVideo } from "./SaveTheDateVideo";
import { LANDING5_MOBILE, LANDING6_DESKTOP } from "./welcome-assets";

/** Final page — full invitation artwork + nav */
export function ThirdPage() {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [saveTheDateOpen, setSaveTheDateOpen] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const openOurStory = useCallback(() => {
    setSaveTheDateOpen(false);
    setOurStoryOpen(true);
  }, []);

  const closeOurStory = useCallback(() => {
    setOurStoryOpen(false);
  }, []);

  const openSaveTheDate = useCallback(() => {
    setOurStoryOpen(false);
    setSaveTheDateOpen(true);
  }, []);

  const closeSaveTheDate = useCallback(() => {
    setSaveTheDateOpen(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        id="home"
        className="fixed inset-0 z-[99999] overflow-hidden bg-[#F4EFE6]"
        style={{ width: "100vw", height: "100dvh" }}
        data-page="landing3-final"
      >
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.1, ease: luxuryEase }}
        >
          {/* Mac — edge-to-edge cover */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANDING6_DESKTOP}
              alt="Dharmi and Arpit wedding invitation"
              className="absolute left-1/2 top-1/2 h-[100dvh] w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-[50%_40%]"
              decoding="sync"
              fetchPriority="high"
              draggable={false}
              data-page="landing6-desktop"
            />
          </div>

          {/* Phone — edge-to-edge cover */}
          <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LANDING5_MOBILE}
              alt="Dharmi and Arpit wedding invitation"
              className="absolute left-1/2 top-1/2 h-[100dvh] w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
              decoding="sync"
              fetchPriority="high"
              draggable={false}
              data-page="landing5-mobile"
            />
          </div>
        </motion.div>

        <PostRevealNav
          reveal={revealed}
          onOurStoryClick={openOurStory}
          onSaveTheDateClick={openSaveTheDate}
        />
      </motion.div>

      <OurStoryScroll open={ourStoryOpen} onClose={closeOurStory} />
      <SaveTheDateVideo open={saveTheDateOpen} onClose={closeSaveTheDate} />
    </>,
    document.body
  );
}
