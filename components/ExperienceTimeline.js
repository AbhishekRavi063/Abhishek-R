"use client";

const EXPERIENCE = [
  {
    role: "Software Engineer & System Architect",
    org: "Little Care",
    location: "Calicut, Kerala",
    period: "Sep 2025 – Present",
  },
  {
    role: "Software Engineer & System Architect",
    org: "Koott",
    location: "Calicut, Kerala",
    period: "Jun 2025 – Present",
  },
  {
    role: "Founding Engineer",
    org: "QuDemo",
    location: "Remote",
    period: "May 2025 – Feb 2026",
  },
  {
    role: "Python Developer",
    org: "Webandcrafts",
    location: "Thrissur, Kerala",
    period: "Dec 2024 – Jun 2025",
  },
  {
    role: "Intern",
    org: "UST Global",
    location: "Remote",
    period: "Aug 2023 – Sep 2023",
  },
];

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export default function ExperienceTimeline({ scrollProgress }) {
  const numItems = EXPERIENCE.length;

  // Point positions as fraction of timeline (center of each item row)
  const pointPositions = EXPERIENCE.map((_, i) => (i + 0.5) / numItems);
  // When each point activates (same threshold as pointProgress >= 1)
  const pointTriggers = EXPERIENCE.map((_, i) => 0.08 + (i / numItems) * 0.65 + 0.05);

  // Line height: sync with point positions so line reaches each point when it activates
  let lineHeightPct = 0;
  if (scrollProgress <= 0) {
    lineHeightPct = 0;
  } else if (scrollProgress >= 1) {
    lineHeightPct = 100;
  } else {
    let didBreak = false;
    for (let i = 0; i < numItems; i++) {
      if (scrollProgress < pointTriggers[i]) {
        if (i === 0) {
          lineHeightPct = (scrollProgress / pointTriggers[0]) * pointPositions[0] * 100;
        } else {
          const t = (scrollProgress - pointTriggers[i - 1]) / (pointTriggers[i] - pointTriggers[i - 1]);
          lineHeightPct = (pointPositions[i - 1] + (pointPositions[i] - pointPositions[i - 1]) * t) * 100;
        }
        didBreak = true;
        break;
      }
    }
    if (!didBreak) {
      const t = (scrollProgress - pointTriggers[numItems - 1]) / (1 - pointTriggers[numItems - 1]);
      lineHeightPct = (pointPositions[numItems - 1] + (1 - pointPositions[numItems - 1]) * t) * 100;
    }
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-2xl px-4 sm:px-6 md:px-12">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-10 text-center"
          style={{
            opacity: easeOutCubic(Math.min(scrollProgress * 2, 1)),
            transform: `translateY(${20 - easeOutCubic(Math.min(scrollProgress * 2, 1)) * 20}px)`,
            textShadow: "0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)",
          }}
        >
          Experience
        </h2>

        <div className="relative">
          {/* Vertical timeline line – synced with point positions */}
          <div
            className="absolute left-[9px] sm:left-[11px] top-0 w-0.5 rounded-full bg-white/90 transition-all duration-100"
            style={{
              height: `${lineHeightPct}%`,
              boxShadow: scrollProgress > 0 ? "0 0 8px rgba(255,255,255,0.5)" : "none",
            }}
          />

          {EXPERIENCE.map((exp, i) => {
            const itemStart = 0.08 + (i / numItems) * 0.65;
            const itemEnd = itemStart + 0.18;
            const rawProgress = (scrollProgress - itemStart) / (itemEnd - itemStart);
            const progress = Math.max(0, Math.min(1, rawProgress));
            const eased = easeOutCubic(progress);
            const pointProgress = Math.max(0, Math.min(1, (scrollProgress - itemStart + 0.05) / 0.1));

            return (
              <div
                key={i}
                className="relative flex gap-3 sm:gap-6 py-4 sm:py-5 md:py-6 pl-0"
                style={{ opacity: eased }}
              >
                {/* Timeline point – hidden until active */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div
                    className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full border-2 transition-all duration-200"
                    style={{
                      opacity: pointProgress >= 1 ? 1 : 0,
                      borderColor: "rgba(255,255,255,0.95)",
                      background: "rgba(255,255,255,0.9)",
                      boxShadow: pointProgress >= 1 ? "0 0 12px rgba(255,255,255,0.6)" : "none",
                    }}
                  />
                </div>

                {/* Content – designation main, company & location secondary */}
                <div
                  className="flex-1 min-w-0"
                  style={{
                    textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <h3 className="font-semibold text-white text-base sm:text-lg">{exp.role}</h3>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                    {exp.org}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  <p className="text-white/70 text-xs sm:text-sm mt-0.5">{exp.period}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
