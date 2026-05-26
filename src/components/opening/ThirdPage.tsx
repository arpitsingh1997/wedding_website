"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { luxuryEase } from "@/lib/motion";
import { isDesktopViewport } from "@/lib/viewport";
import { OurStoryScroll } from "./OurStoryScroll";
import { PostRevealNav } from "./PostRevealNav";
import { SaveTheDateVideo } from "./SaveTheDateVideo";
import { LANDING5_MOBILE, LANDING6_DESKTOP } from "./welcome-assets";

/** Final page — full invitation artwork + nav */
export function ThirdPage() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [saveTheDateOpen, setSaveTheDateOpen] = useState(false);
  const [ourStoryOpen, setOurStoryOpen] = useState(false);

  useEffect(() => {
    setIsDesktop(isDesktopViewport());
    setMounted(true);
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const goHome = useCallback(() => {
    setSaveTheDateOpen(false);
    setOurStoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const imageSrc = isDesktop ? LANDING6_DESKTOP : LANDING5_MOBILE;
  const pageId = isDesktop ? "landing6-desktop" : "landing5-mobile";

  return createPortal(
    <>
      <motion.div
        id="home"
        className="fixed inset-0 z-[99999] overflow-hidden bg-[#F4EFE6]"
        style={{ width: "100vw", height: "100dvh" }}
        data-page={pageId}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.1, ease: luxuryEase }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Dharmi and Arpit wedding invitation"
            className="pointer-events-none h-full w-full object-cover object-center"
            decoding="sync"
            fetchPriority="high"
            draggable={false}
          />
        </motion.div>

        <PostRevealNav
          reveal={revealed}
          onHomeClick={goHome}
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
