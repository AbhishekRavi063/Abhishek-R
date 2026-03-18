"use client";

import { useMemo } from "react";

const EXPERIENCE = [
  { role: "Software Engineer & System Architect", org: "Little Care", location: "Calicut, Kerala", period: "Sep 2025 – Present" },
  { role: "Software Engineer & System Architect", org: "Koott", location: "Calicut, Kerala", period: "Jun 2025 – Present" },
  { role: "Founding Engineer", org: "QuDemo", location: "Remote", period: "May 2025 – Feb 2026" },
  { role: "Python Developer", org: "Webandcrafts", location: "Thrissur, Kerala", period: "Dec 2024 – Jun 2025" },
  { role: "Intern", org: "UST Global", location: "Remote", period: "Aug 2023 – Sep 2023" },
];

const N = EXPERIENCE.length;

function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

export default function ExperienceTimeline({ scrollProgress }) {
  const p = scrollProgress;

  const { titleOpacity, lineHeight, items } = useMemo(() => {
    const titleOpacity = easeOutCubic(p * 1.8);
    const lineHeight = 100 * smoothstep(p * 1.1);

    const itemProgress = (i) => {
      const start = 0.06 + (i / N) * 0.7;
      const span = 0.14;
      return smoothstep((p - start) / span);
    };

    const items = EXPERIENCE.map((exp, i) => ({
      ...exp,
      opacity: itemProgress(i),
      translateY: 12 * (1 - itemProgress(i)),
      pointOpacity: smoothstep((p - 0.05 - (i / N) * 0.68) / 0.08),
    }));

    return { titleOpacity, lineHeight, items };
  }, [p]);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-2xl px-4 sm:px-6 md:px-12">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-10 text-center"
          style={{
            opacity: titleOpacity,
            transform: `translateY(${16 * (1 - titleOpacity)}px)`,
            textShadow: "0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)",
          }}
        >
          Experience
        </h2>

        <div className="relative">
          <div
            className="absolute left-[9px] sm:left-[11px] top-0 w-0.5 rounded-full bg-white/90"
            style={{
              height: `${lineHeight}%`,
              boxShadow: p > 0.02 ? "0 0 8px rgba(255,255,255,0.5)" : "none",
            }}
          />

          {items.map((exp, i) => (
            <div
              key={i}
              className="relative flex gap-3 sm:gap-6 py-4 sm:py-5 md:py-6 pl-0"
              style={{
                opacity: exp.opacity,
                transform: `translateY(${exp.translateY}px)`,
              }}
            >
              <div className="relative flex-shrink-0 flex flex-col items-center">
                <div
                  className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full border-2"
                  style={{
                    opacity: exp.pointOpacity,
                    borderColor: "rgba(255,255,255,0.95)",
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: exp.pointOpacity > 0.5 ? "0 0 12px rgba(255,255,255,0.6)" : "none",
                  }}
                />
              </div>
              <div
                className="flex-1 min-w-0"
                style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3)" }}
              >
                <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                  <span className="font-semibold text-white text-base sm:text-lg">{exp.role}</span>
                  <span className="text-white/80 text-xs sm:text-sm">@ {exp.org}</span>
                  {exp.location && <span className="text-white/60 text-sm">· {exp.location}</span>}
                </div>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5">{exp.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
