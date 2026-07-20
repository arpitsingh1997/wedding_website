import { OUR_STORY_DESKTOP } from "../welcome-assets";

/** Mac Our Story — single seamless scroll artwork */
export function OurStoryDesktop() {
  return (
    <div className="flex w-full flex-col leading-[0]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={OUR_STORY_DESKTOP}
        alt="Our story"
        className="crisp-image block h-auto w-full max-w-none"
        decoding="sync"
        fetchPriority="high"
        draggable={false}
      />
    </div>
  );
}
