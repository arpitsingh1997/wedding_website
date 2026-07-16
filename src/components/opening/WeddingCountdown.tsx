"use client";

import { useEffect, useState } from "react";

/** Wedding day — January 26, 2027 (local midnight) */
const WEDDING_DATE = new Date(2027, 0, 26);

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(now: Date): TimeLeft {
  const diff = Math.max(0, WEDDING_DATE.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Compact countdown for overlay on landing3 artwork */
export function WeddingCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = timeLeft
    ? [
        { label: "Days", value: String(timeLeft.days) },
        { label: "Hrs", value: pad(timeLeft.hours) },
        { label: "Min", value: pad(timeLeft.minutes) },
        { label: "Sec", value: pad(timeLeft.seconds) },
      ]
    : [
        { label: "Days", value: "—" },
        { label: "Hrs", value: "—" },
        { label: "Min", value: "—" },
        { label: "Sec", value: "—" },
      ];

  return (
    <div className="flex items-start justify-center gap-3.5 sm:gap-5" aria-live="polite">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-start gap-3.5 sm:gap-5">
          {index > 0 && (
            <span
              className="mt-1 font-display text-2xl font-light text-[#7B2D26]/35 sm:text-3xl"
              aria-hidden
            >
              :
            </span>
          )}
          <div className="flex min-w-[3.1rem] flex-col items-center sm:min-w-[3.75rem]">
            <span className="font-display text-4xl font-medium leading-none tracking-wide text-[#7B2D26] sm:text-5xl">
              {unit.value}
            </span>
            <span className="mt-2 font-display text-[10px] font-medium tracking-[0.22em] text-[#7B2D26]/65 uppercase sm:text-[11px]">
              {unit.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
