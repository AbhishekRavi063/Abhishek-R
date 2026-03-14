"use client";

import { useState, useEffect, useRef } from "react";

const LINES = [
  { cmd: "whoami", text: "Self-taught developer from Kerala, India, passionate about building intelligent systems and solving real-world problems with technology." },
  { cmd: "cat journey.txt", text: "I started by teaching myself programming, which led me into full-stack development—production systems, SaaS platforms, and scalable web applications." },
  { cmd: "cat focus.txt", text: "Over time my interests shifted toward Brain-Computer Interfaces (BCI). I'm focused on EEG signal processing and ML to explore how humans interact with computers through neural signals." },
  { cmd: "cat education.txt", text: "B.Tech in Computer Science Engineering from APJ Abdul Kalam Technological University, Kerala. I continue to learn and build at the intersection of AI, neuroscience, and software engineering." },
];

export default function AboutTerminal() {
  const [visibleLines, setVisibleLines] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef(null);

  // Start animation when 50% of section is in viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
      }, i * 800)
    );

    return () => timers.forEach(clearTimeout);
  }, [hasStarted]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex items-center justify-center overflow-hidden py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-8"
      style={{ height: "100vh", minHeight: "100vh", maxHeight: "100vh" }}
    >
      {/* Greenhill background - stretch to fill */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/greenhill.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100%",
          height: "100%",
          width: "100%",
        }}
      />
      <div className="absolute inset-0 bg-[#0d1117]/85" />
      <div className="relative z-10 w-full max-w-3xl mx-auto px-2 sm:px-4">
      <div className="w-full">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-t-xl border border-white/10 border-b-0" style={{ background: "#161b22" }}>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-white/40 text-sm ml-2">about.txt</span>
        </div>

        {/* Terminal body */}
        <div
          className="px-4 py-4 sm:px-6 sm:py-6 rounded-b-xl border border-white/10 font-mono text-xs sm:text-sm md:text-base overflow-hidden"
          style={{
            background: "#0d1117",
            boxShadow: "0 0 40px rgba(0,0,0,0.4)",
          }}
        >
          {visibleLines.map((line, i) => (
            <div key={i} className="mb-4 animate-about-fade-in">
              <div className="flex flex-wrap gap-2 mb-1">
                <span className="text-green-400">$</span>
                <span className="text-cyan-400">{line.cmd}</span>
              </div>
              <p className="text-white/85 leading-relaxed pl-4 border-l-2 border-green-500/50">
                {line.text}
              </p>
            </div>
          ))}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-green-400">$</span>
            <span className="w-2 h-4 bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
