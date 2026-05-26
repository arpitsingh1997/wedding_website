"use client";

/** Soft corner botanical flourishes — pure SVG, no assets */
export function CornerFlourish() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
      <svg
        className="absolute -right-4 -top-2 h-[min(42vh,320px)] w-[min(42vw,320px)] opacity-[0.55]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <ellipse cx="160" cy="55" rx="28" ry="32" fill="#E8B4BC" fillOpacity="0.7" />
        <ellipse cx="130" cy="80" rx="22" ry="26" fill="#F0C8CE" fillOpacity="0.65" />
        <ellipse cx="175" cy="95" rx="18" ry="22" fill="#E8B4BC" fillOpacity="0.5" />
        <path
          d="M 40 180 Q 90 120 160 40"
          stroke="#C4A574"
          strokeWidth="0.6"
          strokeOpacity="0.35"
        />
      </svg>
      <svg
        className="absolute -bottom-4 -left-4 h-[min(38vh,280px)] w-[min(38vw,280px)] opacity-[0.5]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <ellipse cx="45" cy="145" rx="26" ry="30" fill="#E8B4BC" fillOpacity="0.65" />
        <ellipse cx="75" cy="120" rx="20" ry="24" fill="#F0C8CE" fillOpacity="0.6" />
        <ellipse cx="30" cy="110" rx="16" ry="20" fill="#E8B4BC" fillOpacity="0.45" />
      </svg>
    </div>
  );
}
