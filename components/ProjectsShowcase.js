"use client";

import { useRef, useState, useEffect } from "react";

const PROJECTS = [
  { title: "EEG Pipeline Agent", tag: "BCI / AutoML", color: "cyan", icon: "brain", desc: "Modular AutoML framework for EEG motor imagery classification with ICA, CSP, EEGNet. Desktop + web visualization tools.", tags: ["Python", "EEGNet", "MNE"], link: "#" },
  { title: "QuDemo", tag: "SaaS", color: "violet", icon: "rocket", desc: "Full-stack demo platform with Next.js, FastAPI, vector search & AI. Live streaming, analytics, subscription access.", tags: ["Next.js", "FastAPI", "AI"], link: "#" },
  { title: "Little Care", tag: "Booking", color: "emerald", icon: "calendar", desc: "End-to-end session booking platform with role-based dashboards. Reduced operational workload by 80%.", tags: ["React", "Node", "Automation"], link: "#" },
  { title: "AICaller", tag: "AI", color: "sky", icon: "bot", desc: "AI-powered customer support automation handling inbound queries and workflows end-to-end.", tags: ["AI", "Automation", "Support"], link: "#" },
  { title: "MI Classification", tag: "BCI", color: "fuchsia", icon: "chart", desc: "Configurable EEG MI pipeline with ICA/ASR, CSP, Riemannian classifiers. Koott automations, Wix maintenance, pipeline development.", tags: ["pyRiemann", "MOABB", "EEG"], link: "#" },
  { title: "Qwipboard", tag: "AI Tool", color: "teal", icon: "bot", desc: "AI-integrated clipboard. Get ChatGPT answers via copy-paste or hotkeys without switching tabs. Runs on terminal.", tags: ["Python", "AWS", "Parallel"], link: "#" },
  { title: "Koott", tag: "Booking", color: "amber", icon: "calendar", desc: "End-to-end full-stack web application for online session bookings. Automations, Wix maintenance, workflow development.", tags: ["React", "Node", "Automation"], link: "#" },
];

const ICONS = {
  brain: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
  ),
  rocket: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
  ),
  calendar: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  wave: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
  ),
  monitor: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ),
  bot: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57-1.402A2.25 2.25 0 0016.5 15h-1.5m0 0l-1 1m1-1v1.5M12 18.75l-1 1m1-1v-4M7.5 15h-1.5l-1.57 1.402a2.25 2.25 0 01-.659 1.591L3 15.3" /></svg>
  ),
  chart: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
  ),
  wallet: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
  ),
  health: (className) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
  ),
};

const COLOR_MAP = {
  cyan: { glow: "rgba(34, 211, 238, 0.4)", border: "rgba(34, 211, 238, 0.5)", text: "text-cyan-400" },
  violet: { glow: "rgba(139, 92, 246, 0.4)", border: "rgba(139, 92, 246, 0.5)", text: "text-violet-400" },
  emerald: { glow: "rgba(52, 211, 153, 0.4)", border: "rgba(52, 211, 153, 0.5)", text: "text-emerald-400" },
  amber: { glow: "rgba(245, 158, 11, 0.4)", border: "rgba(245, 158, 11, 0.5)", text: "text-amber-400" },
  rose: { glow: "rgba(251, 113, 133, 0.4)", border: "rgba(251, 113, 133, 0.5)", text: "text-rose-400" },
  sky: { glow: "rgba(56, 189, 248, 0.4)", border: "rgba(56, 189, 248, 0.5)", text: "text-sky-400" },
  fuchsia: { glow: "rgba(217, 70, 239, 0.4)", border: "rgba(217, 70, 239, 0.5)", text: "text-fuchsia-400" },
  teal: { glow: "rgba(45, 212, 191, 0.4)", border: "rgba(45, 212, 191, 0.5)", text: "text-teal-400" },
  lime: { glow: "rgba(132, 204, 22, 0.4)", border: "rgba(132, 204, 22, 0.5)", text: "text-lime-400" },
};

function ProjectCard({ project, index, isSpotlit, onHover }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("scale(1)");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const colors = COLOR_MAP[project.color] || COLOR_MAP.cyan;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
      setTransform("scale(1)");
      setIsHovered(false);
      onHover?.(null);
      setMousePos({ x: 0.5, y: 0.5 });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      onHover?.(index);
      setTransform("scale(1.06)");
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [index, onHover]);

  const IconComponent = ICONS[project.icon] || ICONS.brain;

  return (
    <div data-card-wrapper className="h-full">
      <div
        ref={cardRef}
        className="group relative h-full cursor-pointer"
        style={{
          transform,
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
          opacity: isSpotlit ? 0.35 : 1,
        }}
      >
        <div
          className="relative h-full overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%)",
            borderColor: isHovered ? colors.border : "rgba(255,255,255,0.08)",
            boxShadow: isHovered
              ? `0 0 60px -12px ${colors.glow}, 0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`
              : "0 4px 24px -4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Shine overlay - follows cursor */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.08), transparent 40%)`,
            }}
          />

          {/* Animated gradient border glow */}
          <div
            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"
            style={{
              background: `linear-gradient(135deg, ${colors.glow}, transparent 40%, transparent 60%, ${colors.glow})`,
              filter: "blur(8px)",
            }}
          />

          <div className="relative p-4 sm:p-6 flex flex-col h-full min-h-[200px] sm:min-h-[220px]">
            {/* Icon + tag row */}
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"}`}
                style={{ background: `linear-gradient(135deg, ${colors.glow}, ${colors.border})`, opacity: 0.9 }}
              >
                {IconComponent("w-5 h-5 text-white")}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-semibold transition-colors ${colors.text}`}>
                {project.tag}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-3 tracking-tight">{project.title}</h3>
            <p className="text-sm text-white/55 leading-relaxed flex-1 line-clamp-3 mb-4">
              {project.desc}
            </p>

            {/* Tags - interactive */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all duration-300 group-hover:bg-white/10 group-hover:text-white/80 group-hover:border-white/15"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function useWindowWidth() {
  const [mounted, setMounted] = useState(false);
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    setMounted(true);
    setWidth(window.innerWidth);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { width, mounted };
}

export default function ProjectsShowcase() {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [parallax, setParallax] = useState({ bgY: 0, bgX: 0, headingY: 0, headingScale: 1, cardsY: 0 });
  const { width: winW, mounted } = useWindowWidth();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const inView = rect.top < vh * 1.2 && rect.bottom > -vh * 0.2;
        if (!inView) return;

        const progress = Math.max(0, Math.min(1, (vh * 0.6 - rect.top) / (vh * 0.8)));
        const scrollParallax = (rect.top - vh * 0.4) * 0.15;

        setParallax({
          bgY: scrollParallax * 1.2,
          bgX: scrollParallax * 0.8,
          headingY: (1 - progress) * 60,
          headingScale: 0.88 + progress * 0.12,
          cardsY: (1 - progress) * 35,
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const duplicated = [...PROJECTS, ...PROJECTS];
  // Use consistent values during SSR/initial hydration to avoid mismatch
  const CARD_WIDTH = !mounted ? 340 : winW < 640 ? 280 : winW < 1024 ? 300 : 340;
  const GAP = !mounted ? 24 : winW < 640 ? 16 : 24;
  const TRACK_WIDTH = duplicated.length * (CARD_WIDTH + GAP) - GAP;

  return (
      <section
        ref={sectionRef}
        id="projects"
        className="relative min-h-[80vh] sm:min-h-screen py-12 sm:py-16 md:py-20 overflow-hidden"
      style={{
        background: "#0a0a0f",
        backgroundImage: `
          linear-gradient(rgba(100, 150, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100, 150, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        backgroundPosition: `${parallax.bgX}px ${parallax.bgY}px`,
        transition: "background-position 0.15s ease-out",
      }}
    >
      <div
        className="text-center mb-8 sm:mb-12 md:mb-16 px-4 will-change-transform"
        style={{ transform: `translateY(${parallax.headingY}px) scale(${parallax.headingScale})`, transition: "transform 0.1s ease-out" }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-cyan-200/90 to-white bg-clip-text text-transparent">
          Projects
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white/45 max-w-xl mx-auto leading-relaxed">
          Full-stack products, BCI research & AI systems
        </p>
      </div>

      <div
        ref={containerRef}
        data-carousel-container
        className="relative overflow-hidden pt-12 sm:pt-0 will-change-transform"
        style={{ transform: `translateY(${parallax.cardsY}px)`, transition: "transform 0.12s ease-out" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-6 py-4"
          style={{
            width: TRACK_WIDTH,
            animation: "carousel 45s linear infinite",
            animationPlayState: isPaused ? "paused" : "running",
            "--carousel-offset": `-${TRACK_WIDTH / 2}px`,
            willChange: "transform",
          }}
        >
          {duplicated.map((project, i) => (
            <div key={`${project.title}-${i}`} className="flex-shrink-0" style={{ width: CARD_WIDTH }}>
              <ProjectCard
                project={project}
                index={i}
                isSpotlit={hoveredIndex !== null && hoveredIndex !== i}
                onHover={setHoveredIndex}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
