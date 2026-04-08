"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import ContactSection from "@/components/ContactSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import DessertAbout from "@/components/DessertAbout";
import AboutTerminal from "@/components/AboutTerminal";
const SkillsBubbles = dynamic(() => import("@/components/SkillsBubbles"), { ssr: false });
const SignalFilter = dynamic(() => import("@/components/SignalFilter"), { ssr: false });

export default function Home() {
  const heroRef = useRef(null);
  const headerRef = useRef(null);
  const leftCloudRef = useRef(null);
  const rightCloudRef = useRef(null);
  const centerCloudRef = useRef(null);
  const cloud4Ref = useRef(null);
  const cloud5Ref = useRef(null);
  const heroBgRef = useRef(null);
  const desertSectionRef = useRef(null);
  const desertCanvasRef = useRef(null);
  const desertFramesRef = useRef([]);
  const desertCtxRef = useRef(null);
  const currentFrameRef = useRef(-1);
  const [desertFramesLoaded, setDesertFramesLoaded] = useState(false);

  // Second scroll animation (dessert)
  const dessertSectionRef = useRef(null);
  const dessertCanvasRef = useRef(null);
  const dessertFramesRef = useRef([]);
  const dessertCtxRef = useRef(null);
  const currentDessertFrameRef = useRef(-1);
  const [dessertFramesLoaded, setDessertFramesLoaded] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const headerNavRef = useRef(null);
  const heroHoverRef = useRef(false);
  const heroPushAmountRef = useRef(0);

  const TOTAL_FRAMES = 150;
  const TOTAL_DESSERT_FRAMES = 130;
  const rafRef = useRef(null);
  const [hillScrollProgress, setHillScrollProgress] = useState(0);
  const desertCurrentProgressRef = useRef(0);
  const dessertCurrentProgressRef = useRef(0);
  // Mobile detection (used to halve frame counts)
  const isMobileRef = useRef(false);
  useEffect(() => {
    isMobileRef.current = typeof window !== "undefined" && window.innerWidth < 640;
  }, []);

  // Visibility tracking for performance optimization
  const heroVisibleRef = useRef(true);
  const hillVisibleRef = useRef(false);
  const dessertVisibleRef = useRef(false);

  // Hero cloud positions (approx % from top-left) for push-away from text
  const heroCloudPositions = [
    { ref: leftCloudRef, cx: 12, cy: 75 },
    { ref: rightCloudRef, cx: 88, cy: 75 },
    { ref: centerCloudRef, cx: 50, cy: 75, center: true },
    { ref: cloud4Ref, cx: 85, cy: 72 },
    { ref: cloud5Ref, cx: 28, cy: 72 },
  ];
  const heroTextCenter = { x: 22, y: 45 };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const lazyEase = (t) => 1 - Math.pow(1 - t, 1.8);
    const baseLerpSpeed = 0.055;
    const getLerpSpeed = (gap) => {
      if (gap < 0.003) return baseLerpSpeed * 0.03;
      if (gap < 0.01) return baseLerpSpeed * (0.03 + 0.17 * (gap - 0.003) / 0.007);
      if (gap < 0.03) return baseLerpSpeed * (0.2 + 0.5 * (gap - 0.01) / 0.02);
      return baseLerpSpeed;
    };

    const drawBlendedFrame = (ctx, canvas, framesRef, totalFrames, displayProgress) => {
      const frameFloat = displayProgress * totalFrames;
      const floorFrame = Math.min(Math.floor(frameFloat), totalFrames - 1);
      const frac = Math.min(frameFloat - floorFrame, 1);
      const img0 = framesRef.current[floorFrame];
      const img1 = frac > 0.01 && floorFrame + 1 < totalFrames ? framesRef.current[floorFrame + 1] : null;
      if (img0 && img0.complete) {
        ctx.globalAlpha = 1;
        ctx.drawImage(img0, 0, 0, canvas.width, canvas.height);
        if (img1 && img1.complete) {
          ctx.globalAlpha = frac;
          ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
        }
      }
    };

    // Shared intersection observers to manage visibility
    const observerOptions = { threshold: 0 };
    const heroObs = new IntersectionObserver(([e]) => { heroVisibleRef.current = e.isIntersecting; }, observerOptions);
    const hillObs = new IntersectionObserver(([e]) => { hillVisibleRef.current = e.isIntersecting; }, observerOptions);
    const dessertObs = new IntersectionObserver(([e]) => { dessertVisibleRef.current = e.isIntersecting; }, observerOptions);

    if (heroRef.current) heroObs.observe(heroRef.current);
    if (desertSectionRef.current) hillObs.observe(desertSectionRef.current);
    if (dessertSectionRef.current) dessertObs.observe(dessertSectionRef.current);

    let lastTime = 0;
    const mobileInterval = 1000 / 30; // 30fps throttle for mobile

    const updateAllAnimations = (timestamp) => {
      const isMobile = isMobileRef.current;
      if (isMobile && timestamp - lastTime < mobileInterval) {
        rafRef.current = requestAnimationFrame(updateAllAnimations);
        return;
      }
      lastTime = timestamp;

      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      const elapsed = timestamp / 1000;

      // 1. Hero Clouds Animation
      if (heroVisibleRef.current) {
        const targetPush = !isMobile && heroHoverRef.current ? 50 : 0;
        heroPushAmountRef.current += (targetPush - heroPushAmountRef.current) * 0.04;

        const baseOffsets = [
          { y: -80 + Math.sin(elapsed * 0.3) * 50, x: Math.cos(elapsed * 0.2) * 45 },
          { y: -80 + Math.sin(elapsed * 0.3 + Math.PI * 0.66) * 55, x: Math.cos(elapsed * 0.22 + Math.PI * 0.5) * 50 },
          { y: -100 + Math.sin(elapsed * 0.25 + Math.PI * 1.33) * 45, x: Math.cos(elapsed * 0.22 + Math.PI) * 40 },
          { y: -60 + Math.sin(elapsed * 0.22 + Math.PI * 0.4) * 40, x: Math.cos(elapsed * 0.18 + Math.PI * 0.8) * 35 },
          { y: -70 + Math.sin(elapsed * 0.2 + Math.PI * 1.8) * 35, x: Math.cos(elapsed * 0.24 + Math.PI * 1.2) * 30 },
        ];

        heroCloudPositions.forEach((pos, i) => {
          const el = pos.ref?.current;
          if (!el) return;
          const dx = pos.cx - heroTextCenter.x;
          const dy = pos.cy - heroTextCenter.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const pushX = (dx / len) * heroPushAmountRef.current;
          const pushY = (dy / len) * heroPushAmountRef.current;
          const base = baseOffsets[i];
          const totalX = base.x + pushX;
          const totalY = base.y + pushY;
          if (pos.center) el.style.transform = `translate3d(calc(-50% + ${totalX}px), ${totalY}px, 0)`;
          else el.style.transform = `translate3d(${totalX}px, ${totalY}px, 0)`;
        });

        if (headerRef.current) {
          const hOffset = Math.sin(elapsed * 1.2) * 6;
          headerRef.current.style.transform = `translateY(${hOffset}px)`;
        }
      }

      // 2. Hill Scroll Animation - Block Scoped
      {
        if (hillVisibleRef.current && desertCanvasRef.current && desertFramesRef.current.length > 0) {
          const section = desertSectionRef.current;
          const startScroll = section.offsetTop - vh;
          const endScroll = section.offsetTop + section.offsetHeight - vh;
          let targetProgress = (scrollY - startScroll) / (endScroll - startScroll);
          targetProgress = Math.max(0, Math.min(1, easeInOutCubic(targetProgress)));
          const current = desertCurrentProgressRef.current;
          const gap = Math.abs(targetProgress - current);
          desertCurrentProgressRef.current += (targetProgress - current) * getLerpSpeed(gap);
          const displayProgress = desertCurrentProgressRef.current;
          setHillScrollProgress(displayProgress);
          if (!desertCtxRef.current) desertCtxRef.current = desertCanvasRef.current.getContext("2d", { alpha: false });
          drawBlendedFrame(desertCtxRef.current, desertCanvasRef.current, desertFramesRef, TOTAL_FRAMES, Math.min(displayProgress, 1));
        }
      }

      // 3. Dessert Scroll Animation - Block Scoped
      {
        if (dessertVisibleRef.current && dessertCanvasRef.current && dessertFramesRef.current.length > 0) {
          const section = dessertSectionRef.current;
          let targetProgress = (scrollY - section.offsetTop) / (section.offsetHeight - vh);
          targetProgress = Math.max(0, Math.min(1, lazyEase(targetProgress)));
          const current = dessertCurrentProgressRef.current;
          const gap = Math.abs(targetProgress - current);
          dessertCurrentProgressRef.current += (targetProgress - current) * getLerpSpeed(gap);
          const displayProgress = dessertCurrentProgressRef.current;
          if (!dessertCtxRef.current) dessertCtxRef.current = dessertCanvasRef.current.getContext("2d", { alpha: false });
          drawBlendedFrame(dessertCtxRef.current, dessertCanvasRef.current, dessertFramesRef, TOTAL_DESSERT_FRAMES, Math.min(displayProgress, 1));
        }
      }

      rafRef.current = requestAnimationFrame(updateAllAnimations);
    };

    rafRef.current = requestAnimationFrame(updateAllAnimations);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      heroObs.disconnect();
      hillObs.disconnect();
      dessertObs.disconnect();
    };
  }, []);

  // Moderate scroll speed in the video frame section (dessert)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const WHEEL_MODIFIER = 0.45;
    const PIXELS_PER_LINE = 100 / 6;

    const handleWheel = (e) => {
      const dessert = document.getElementById("section-dessert");

      const sections = [dessert].filter(Boolean);
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;

      const isInVideoSection = sections.some((el) => {
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        return scrollY + viewportHeight > top && scrollY < bottom;
      });

      if (!isInVideoSection) return;

      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= PIXELS_PER_LINE;
      else if (e.deltaMode === 2) deltaY *= viewportHeight;

      const maxScroll = document.documentElement.scrollHeight - viewportHeight;
      const newScroll = Math.max(0, Math.min(maxScroll, scrollY + deltaY * WHEEL_MODIFIER));

      if (Math.abs(deltaY) > 2) {
        e.preventDefault();
        window.scrollTo({ top: newScroll, behavior: "auto" });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });

    return () => window.removeEventListener("wheel", handleWheel, { capture: true });
  }, []);

  // Defer frame loading until sections are near viewport (reduces initial load)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let desertLoaded = false;
    let dessertLoaded = false;

    const loadDesertFrames = () => {
      if (desertLoaded) return;
      desertLoaded = true;

      const isMobile = isMobileRef.current;
      // On mobile: load every 2nd frame (75 instead of 150) to halve memory usage
      const frameStep = isMobile ? 2 : 1;
      const framesToLoad = isMobile ? Math.ceil(TOTAL_FRAMES / 2) : TOTAL_FRAMES;
      const frames = new Array(TOTAL_FRAMES).fill(null);
      let loadedCount = 0;

      for (let i = 1; i <= TOTAL_FRAMES; i += frameStep) {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === framesToLoad) setDesertFramesLoaded(true);
        };
        img.src = `/desert-frames/frame_${String(i).padStart(4, "0")}.jpg`;
        // Fill both slots on mobile (frame i and i+1 point to same image)
        frames[i - 1] = img;
        if (isMobile && i + 1 <= TOTAL_FRAMES) frames[i] = img;
      }
      desertFramesRef.current = frames;
      const first = frames[0];
      if (first) {
        const setupCanvas = () => {
          const canvas = desertCanvasRef.current;
          if (canvas && first.complete && first.naturalWidth > 0) {
            canvas.width = first.naturalWidth;
            canvas.height = first.naturalHeight;
            const ctx = canvas.getContext("2d", { alpha: false });
            ctx?.drawImage(first, 0, 0, canvas.width, canvas.height);
          }
        };
        if (first.complete) setupCanvas();
        else first.onload = setupCanvas;
      }
    };

    const loadDessertFrames = () => {
      if (dessertLoaded) return;
      dessertLoaded = true;

      const isMobile = isMobileRef.current;
      // On mobile: load every 2nd frame (65 instead of 130) to halve memory usage
      const frameStep = isMobile ? 2 : 1;
      const framesToLoad = isMobile ? Math.ceil(TOTAL_DESSERT_FRAMES / 2) : TOTAL_DESSERT_FRAMES;
      const frames = new Array(TOTAL_DESSERT_FRAMES).fill(null);
      let loadedCount = 0;

      for (let i = 1; i <= TOTAL_DESSERT_FRAMES; i += frameStep) {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === framesToLoad) setDessertFramesLoaded(true);
        };
        img.src = `/dessert-frames/frame_${String(i).padStart(4, "0")}.png`;
        frames[i - 1] = img;
        if (isMobile && i + 1 <= TOTAL_DESSERT_FRAMES) frames[i] = img;
      }
      dessertFramesRef.current = frames;
      const first = frames[0];
      if (first) {
        const setupCanvas = () => {
          const canvas = dessertCanvasRef.current;
          if (canvas && first.complete && first.naturalWidth > 0) {
            canvas.width = first.naturalWidth;
            canvas.height = first.naturalHeight;
            const ctx = canvas.getContext("2d", { alpha: false });
            ctx?.drawImage(first, 0, 0, canvas.width, canvas.height);
          }
        };
        if (first.complete) setupCanvas();
        else first.onload = setupCanvas;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.id === "section-hill") loadDesertFrames();
          if (entry.target.id === "section-dessert") loadDessertFrames();
        });
      },
      { rootMargin: "400px", threshold: 0 }
    );

    const hill = document.getElementById("section-hill");
    const dessert = document.getElementById("section-dessert");
    if (hill) observer.observe(hill);
    if (dessert) observer.observe(dessert);

    return () => observer.disconnect();
  }, []);

  // Initial load overlay - progress bar tracks hero images, hides when all loaded
  useEffect(() => {
    const minTime = 600;
    const start = performance.now();

    const heroImages = [
      "/herobg.jpg",
      "/herocloud.png",
      "/cloud.png",
    ];
    const total = heroImages.length;
    let loaded = 0;

    const onLoad = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) {
        const elapsed = performance.now() - start;
        const remaining = Math.max(0, minTime - elapsed);
        setTimeout(() => setIsLoading(false), remaining);
      }
    };

    heroImages.forEach((src) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = src;
    });

    // Fallback if images take too long
    setTimeout(() => {
      setLoadProgress(100);
      setIsLoading(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (headerNavRef.current && !headerNavRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Loading overlay */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-[1200ms] ease-out pointer-events-none ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: isLoading ? "auto" : "none" }}
        aria-hidden={!isLoading}
      >
        <div className="flex flex-col items-center gap-5 w-full max-w-xs px-6">
          <p className="text-base sm:text-lg text-gray-700 font-medium">Setting up things</p>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      </div>
      <header ref={headerRef} className="fixed inset-x-0 top-2 sm:top-4 z-20 flex justify-center px-2 sm:px-0 pointer-events-none transition-none" style={{ willChange: "transform" }}>
        <div ref={headerNavRef} className="pointer-events-auto relative flex flex-col items-center w-full max-w-[calc(92%+8px)] sm:max-w-none sm:w-3/4 md:w-2/3 lg:w-1/2">
        <nav className="flex w-[92%] sm:w-full items-center justify-between rounded-full border border-white/40 bg-white/20 px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm text-black shadow-lg backdrop-blur-md">
          <span className="font-semibold text-sm sm:text-base">Abhishek R</span>
          {/* Desktop nav links */}
          <div className="hidden sm:flex gap-2 sm:gap-4 [&_a]:transition-[text-shadow] [&_a]:duration-200 [&_a:hover]:[text-shadow:0_0_12px_rgba(255,255,255,0.6)]">
            <a href="#about">About</a>
            <a href="#section-hill">Experience</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
          {/* Mobile hamburger icon - inside the same rounded nav pill */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-[text-shadow] duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.6)]"
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
        {/* Mobile menu dropdown - same glass texture, smooth fade */}
        <div
          aria-hidden={!mobileMenuOpen}
          className={`sm:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[92%] max-w-[280px] rounded-2xl border border-white/40 bg-white/20 backdrop-blur-xl shadow-xl py-3 overflow-hidden transition-all duration-200 ease-out ${
            mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-2.5 text-black hover:bg-white/10">About</a>
          <a href="#section-hill" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-2.5 text-black hover:bg-white/10">Experience</a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-2.5 text-black hover:bg-white/10">Projects</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-2.5 text-black hover:bg-white/10">Contact</a>
        </div>
        </div>
      </header>
      <section
        id="hero"
        ref={heroRef}
        className="relative flex min-h-[100vh] items-center justify-center overflow-hidden"
      >
        <div
          ref={heroBgRef}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/herobg.jpg)" }}
        />
        <div
          className="absolute inset-0 z-0 flex cursor-pointer items-center px-6 sm:px-8 md:px-16 lg:px-24 sm:pointer-events-auto pointer-events-none"
          onMouseEnter={() => { heroHoverRef.current = true; }}
          onMouseLeave={() => { heroHoverRef.current = false; }}
        >
          <div className="text-left cursor-pointer">
            <p className="text-lg text-white/80 md:text-xl">Hi, I am</p>
            <h1 className="text-5xl font-bold text-white md:text-7xl lg:text-8xl">
              Abhishek R
            </h1>
          </div>
        </div>
        <img
          src="/herocloud.png"
          alt=""
          ref={leftCloudRef}
          loading="lazy"
          className="hero-cloud pointer-events-none absolute bottom-0 left-0 z-10 w-1/2 object-contain opacity-40 hidden sm:block"
          style={{ maxHeight: "50%", willChange: "transform" }}
        />
        <img
          src="/cloud.png"
          alt=""
          ref={rightCloudRef}
          loading="lazy"
          className="hero-cloud pointer-events-none absolute bottom-0 right-0 z-10 w-1/2 object-contain opacity-40 hidden sm:block"
          style={{ maxHeight: "50%", willChange: "transform" }}
        />
        <img
          src="/cloud.png"
          alt=""
          ref={centerCloudRef}
          loading="lazy"
          className="hero-cloud pointer-events-none absolute bottom-0 left-1/2 z-10 w-2/3 -translate-x-1/2 object-contain opacity-40 scale-[2.2] sm:scale-100 max-h-[85%] sm:max-h-[50%]"
          style={{ willChange: "transform" }}
        />
        <img
          src="/herocloud.png"
          alt=""
          ref={cloud4Ref}
          loading="lazy"
          className="hero-cloud pointer-events-none absolute bottom-0 right-[15%] z-10 w-2/5 object-contain opacity-35 hidden sm:block"
          style={{ maxHeight: "45%", willChange: "transform" }}
        />
        <img
          src="/cloud.png"
          alt=""
          ref={cloud5Ref}
          loading="lazy"
          className="hero-cloud pointer-events-none absolute bottom-0 left-[20%] z-10 w-1/3 object-contain opacity-30 hidden sm:block"
          style={{ maxHeight: "40%", willChange: "transform" }}
        />
      </section>

      {/* Dessert scroll animation section */}
      <section
        ref={dessertSectionRef}
        id="section-dessert"
        className="relative cursor-pointer"
        style={{ height: "300vh" }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={dessertCanvasRef}
            className="h-full w-full object-cover"
            style={{ display: "block" }}
          />
          <DessertAbout />
        </div>
      </section>

      {/* Terminal About section */}
      <AboutTerminal />

      <section
        id="section-4"
        className="relative h-screen min-h-screen overflow-hidden bg-white"
      >
        <div className="absolute inset-0 h-full w-full">
          <SkillsBubbles />
        </div>
      </section>

      {/* EEG Signal Processing Section */}
      <section
        id="section-signal"
        className="group relative overflow-hidden transition-[background-image] duration-500"
        style={{
          height: "100vh",
          minHeight: "100vh",
          background: "#080810",
          backgroundImage: `
            linear-gradient(rgba(100, 150, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 150, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px"
        }}
      >
        {/* Subtle neural pulse overlay on hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34, 211, 238, 0.06) 0%, transparent 60%)",
          }}
        />
        {/* Floating neural dots background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-500/20 group-hover:bg-cyan-400/40 group-hover:scale-125 transition-all duration-500"
              style={{
                width: 4 + (i % 3) * 2,
                height: 4 + (i % 3) * 2,
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
                animation: `float-dot ${8 + (i % 5)}s ease-in-out infinite`,
                animationDelay: `${-i * 0.8}s`,
              }}
            />
          ))}
        </div>

        {/* Top 70% - Text area in glass card */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center px-4 sm:px-6 md:px-8" style={{ height: "70%" }}>
          <div
            className="relative max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-5 sm:px-8 sm:py-6 shadow-xl group-hover:border-cyan-500/30 group-hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500"
            style={{
              boxShadow: "0 0 40px -10px rgba(100, 150, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              animation: "float-card 6s ease-in-out infinite",
            }}
          >
            <h3 className="text-xs font-semibold tracking-widest text-cyan-400/90 uppercase mb-4">BCI & Signal Processing</h3>
            <div className="space-y-3 sm:space-y-4 text-left">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
                I&apos;ve developed multiple systems involving preprocessing, denoising frameworks, feature extraction, and benchmarking pipelines using both classical and deep learning approaches. My specialization lies in signal processing, EEG denoising methods, and evaluating robust machine learning pipelines for neural decoding.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
                These projects are part of a larger journey of learning, experimenting, and building toward something much bigger in the BCI space… stay tuned 😉
              </p>
            </div>
          </div>
        </div>
        {/* Bottom 30% - Signal visualization */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%" }}>
          <SignalFilter />
        </div>
      </section>

      {/* Hill scroll animation section */}
      <section
        ref={desertSectionRef}
        id="section-hill"
        className="relative cursor-pointer"
        style={{ height: "300vh" }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={desertCanvasRef}
            className="h-full w-full object-cover"
            style={{ display: "block" }}
          />
          <ExperienceTimeline scrollProgress={hillScrollProgress} />
        </div>
      </section>

      {/* Projects Showcase */}
      <ProjectsShowcase />

      {/* Contact */}
      <ContactSection />
    </main>
  );
}
