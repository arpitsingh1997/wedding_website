import { OUR_STORY_SCROLL_PAGES } from "../welcome-assets";

/** Phone Our Story — five full-width panels as one seamless vertical scroll */
export function OurStoryPanelScroll() {
  return (
    <div className="flex w-full flex-col leading-[0]">
      {OUR_STORY_SCROLL_PAGES.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`Our story, page ${index + 1} of ${OUR_STORY_SCROLL_PAGES.length}`}
          className="block w-full max-w-[100vw] h-auto"
          decoding={index === 0 ? "sync" : "async"}
          fetchPriority={index === 0 ? "high" : "auto"}
          draggable={false}
        />
      ))}
    </div>
  );
}
