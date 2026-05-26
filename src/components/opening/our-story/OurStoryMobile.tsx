import { OUR_STORY_PANEL4_IMAGE, OUR_STORY_PHOTOS } from "../welcome-assets";
import { OUR_STORY_COPY } from "./content";

const cream = "bg-[#FFFBF0]";

function StoryDivider() {
  return (
    <div
      className="mx-auto my-7 flex w-full max-w-[14rem] items-center justify-center gap-3 sm:max-w-[16rem]"
      aria-hidden
    >
      <span className="h-px flex-1 bg-[#C4A574]/75" />
      <span className="font-display text-[11px] leading-none text-[#C4A574]">♦︎</span>
      <span className="h-px flex-1 bg-[#C4A574]/75" />
    </div>
  );
}

function StoryPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`select-none ${cream} w-full px-7 pb-10 pt-9 sm:px-10 ${className}`}>{children}</section>
  );
}

function BodyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`text-center font-display text-[15px] font-normal leading-[1.65] tracking-[0.01em] text-[#3A3530] sm:text-base sm:leading-[1.7] ${className}`}
    >
      {children}
    </p>
  );
}

function StoryPhoto({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="block h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />
    </div>
  );
}

function Panel1() {
  const { panel1 } = OUR_STORY_COPY;
  return (
    <StoryPanel className="pb-8">
      <h2 className="text-center font-script text-[5rem] leading-none text-[#7B2D26] sm:text-6xl">
        {panel1.title}
      </h2>
      <p className="mx-auto mt-7 max-w-[19rem] text-center font-display text-[25px] italic leading-[1.55] text-[#9A8060] sm:max-w-[22rem] sm:text-base">
        &ldquo;{panel1.quote}&rdquo;
      </p>
      <StoryDivider />
      <div className="space-y-5">
        {panel1.paragraphs.map((text) => (
          <BodyText key={text.slice(0, 24)}>{text}</BodyText>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-1.5">
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p1[0]}
          alt="Dharmi and Arpit by a Christmas tree"
          className="aspect-[3/4]"
          priority
        />
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p1[1]}
          alt="Dharmi and Arpit by a mountain lake"
          className="aspect-[3/4]"
        />
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p1[2]}
          alt="Dharmi and Arpit by a desert tree"
          className="aspect-[3/4]"
        />
      </div>
    </StoryPanel>
  );
}

function Panel2() {
  const { panel2 } = OUR_STORY_COPY;
  return (
    <StoryPanel className="pt-10">
      <BodyText className="mb-5">{panel2.lead}</BodyText>
      <div className="space-y-5">
        {panel2.paragraphs.map((text) => (
          <BodyText key={text.slice(0, 24)}>{text}</BodyText>
        ))}
      </div>
      <p className="mt-8 text-center font-display text-[15px] italic leading-relaxed text-[#7B2D26] sm:text-base">
        {panel2.closing}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-1.5">
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p2[0]}
          alt="Dharmi and Arpit on a coastal cliff"
          className="aspect-[3/4]"
        />
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p2[1]}
          alt="Dharmi and Arpit in a field of daffodils"
          className="aspect-[3/4]"
        />
      </div>
    </StoryPanel>
  );
}

function Panel3() {
  const { panel3 } = OUR_STORY_COPY;
  return (
    <StoryPanel className="pt-8">
      <div className="grid grid-cols-2 gap-1.5">
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p3[0]}
          alt="Dharmi and Arpit in a garden"
          className="aspect-[3/4]"
        />
        <StoryPhoto
          src={OUR_STORY_PHOTOS.p3[1]}
          alt="Dharmi and Arpit in the snow"
          className="aspect-[3/4]"
        />
      </div>
      <div className="mt-8 space-y-5">
        {panel3.paragraphs.map((text) => (
          <BodyText key={text.slice(0, 24)}>{text}</BodyText>
        ))}
      </div>
    </StoryPanel>
  );
}

function Panel4() {
  const { panel4 } = OUR_STORY_COPY;
  return (
    <StoryPanel className="p-0 px-0 pb-0 pt-0 sm:px-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={OUR_STORY_PANEL4_IMAGE}
        alt={panel4.names}
        className="block h-auto w-full"
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />
    </StoryPanel>
  );
}

/** Phone Our Story — HTML/CSS rebuild of the four-panel scroll */
export function OurStoryMobile() {
  return (
    <div className="flex w-full flex-col">
      <Panel1 />
      <Panel2 />
      <Panel3 />
      <Panel4 />
    </div>
  );
}
