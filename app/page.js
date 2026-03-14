"use client";

import { useState, useEffect, useRef } from "react";
import SkillsBubbles from "@/components/SkillsBubbles";
import SignalFilter from "@/components/SignalFilter";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import ContactSection from "@/components/ContactSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import DessertAbout from "@/components/DessertAbout";
import AboutTerminal from "@/components/AboutTerminal";

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

  const TOTAL_FRAMES = 150;
  const TOTAL_DESSERT_FRAMES = 130;
  const rafRef = useRef(null);
  const [hillScrollProgress, setHillScrollProgress] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateAnimations();
      });
    };

    const easeInOutCubic = (t) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const updateAnimations = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      // Hill frames scroll animation - only when section is in view
      const desertSection = desertSectionRef.current;
      const desertCanvas = desertCanvasRef.current;
      if (desertSection && desertCanvas && desertFramesRef.current.length > 0) {
        const sectionTop = desertSection.offsetTop;
        const sectionHeight = desertSection.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;

        const isInView = scrollY + viewportHeight > sectionTop && scrollY < sectionBottom;

        if (isInView) {
          // Start animation when section is 50% into viewport
          const startScroll = sectionTop - viewportHeight * 0.5;
          const endScroll = sectionBottom - viewportHeight;
          let progress = startScroll < endScroll
            ? (scrollY - startScroll) / (endScroll - startScroll)
            : 0;
          progress = Math.max(0, Math.min(1, progress));
          const easedProgress = easeInOutCubic(progress);

          setHillScrollProgress(progress);

          const frameIndex = Math.min(
            Math.floor(easedProgress * TOTAL_FRAMES),
            TOTAL_FRAMES - 1
          );

          if (frameIndex !== currentFrameRef.current) {
            const img = desertFramesRef.current[frameIndex];
            if (img && img.complete) {
              if (!desertCtxRef.current) {
                desertCtxRef.current = desertCanvas.getContext("2d", { alpha: false });
              }
              desertCtxRef.current.drawImage(img, 0, 0, desertCanvas.width, desertCanvas.height);
              currentFrameRef.current = frameIndex;
            }
          }
        }
      }

      // Dessert frames scroll animation - lazy/smooth, progresses slowly with scroll
      const dessertSection = dessertSectionRef.current;
      const dessertCanvas = dessertCanvasRef.current;
      if (dessertSection && dessertCanvas && dessertFramesRef.current.length > 0) {
        const sectionTop = dessertSection.offsetTop;
        const sectionHeight = dessertSection.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;

        const isInView = scrollY + viewportHeight > sectionTop && scrollY < sectionBottom;

        if (isInView) {
          let progress = (scrollY - sectionTop) / (sectionHeight - viewportHeight);
          progress = Math.max(0, Math.min(1, progress));
          // Lazy easing: gentle ease-out for smooth, slow frame progression
          const lazyEase = (t) => 1 - Math.pow(1 - t, 1.8);
          const smoothProgress = lazyEase(progress);

          const frameIndex = Math.min(
            Math.floor(smoothProgress * TOTAL_DESSERT_FRAMES),
            TOTAL_DESSERT_FRAMES - 1
          );

          if (frameIndex !== currentDessertFrameRef.current) {
            const img = dessertFramesRef.current[frameIndex];
            if (img && img.complete) {
              if (!dessertCtxRef.current) {
                dessertCtxRef.current = dessertCanvas.getContext("2d", { alpha: false });
              }
              dessertCtxRef.current.drawImage(img, 0, 0, dessertCanvas.width, dessertCanvas.height);
              currentDessertFrameRef.current = frameIndex;
            }
          }
        }
      }
    };

    updateAnimations();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Floating cloud animation loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    let animationId;
    let startTime = null;

    const animateClouds = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      // Left cloud - phase 0 (starts going up)
      if (leftCloudRef.current) {
        const yOffset = -80 + Math.sin(elapsed * 0.3) * 50;
        const xOffset = Math.cos(elapsed * 0.2) * 45;
        leftCloudRef.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      }

      // Right cloud - phase offset by 2π/3 (120°) - different direction
      if (rightCloudRef.current) {
        const yOffset = -80 + Math.sin(elapsed * 0.3 + Math.PI * 0.66) * 55;
        const xOffset = Math.cos(elapsed * 0.22 + Math.PI * 0.5) * 50;
        rightCloudRef.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      }

      // Center cloud - phase offset by 4π/3 (240°) - another different direction
      if (centerCloudRef.current) {
        const yOffset = -100 + Math.sin(elapsed * 0.25 + Math.PI * 1.33) * 45;
        const xOffset = Math.cos(elapsed * 0.22 + Math.PI) * 40;
        centerCloudRef.current.style.transform = `translate3d(calc(-50% + ${xOffset}px), ${yOffset}px, 0)`;
      }

      // Cloud 4 - herocloud on bottom right area
      if (cloud4Ref.current) {
        const yOffset = -60 + Math.sin(elapsed * 0.22 + Math.PI * 0.4) * 40;
        const xOffset = Math.cos(elapsed * 0.18 + Math.PI * 0.8) * 35;
        cloud4Ref.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      }

      // Cloud 5 - regular cloud on left-center area
      if (cloud5Ref.current) {
        const yOffset = -70 + Math.sin(elapsed * 0.2 + Math.PI * 1.8) * 35;
        const xOffset = Math.cos(elapsed * 0.24 + Math.PI * 1.2) * 30;
        cloud5Ref.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      }

      // Header - subtle slow float up and down
      if (headerRef.current) {
        const yOffset = Math.sin(elapsed * 1.2) * 6;
        headerRef.current.style.transform = `translateY(${yOffset}px)`;
      }

      animationId = requestAnimationFrame(animateClouds);
    };

    animationId = requestAnimationFrame(animateClouds);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Defer frame loading until sections are near viewport (reduces initial load)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let desertLoaded = false;
    let dessertLoaded = false;

    const loadDesertFrames = () => {
      if (desertLoaded) return;
      desertLoaded = true;

      const frames = [];
      let loadedCount = 0;
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = `/desert-frames/frame_${String(i).padStart(4, "0")}.jpg`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) setDesertFramesLoaded(true);
        };
        frames.push(img);
      }
      desertFramesRef.current = frames;
      const first = frames[0];
      first.onload = () => {
        const canvas = desertCanvasRef.current;
        if (canvas && first.complete) {
          canvas.width = first.naturalWidth;
          canvas.height = first.naturalHeight;
          const ctx = canvas.getContext("2d", { alpha: false });
          ctx?.drawImage(first, 0, 0, canvas.width, canvas.height);
        }
      };
    };

    const loadDessertFrames = () => {
      if (dessertLoaded) return;
      dessertLoaded = true;

      const frames = [];
      let loadedCount = 0;
      for (let i = 1; i <= TOTAL_DESSERT_FRAMES; i++) {
        const img = new Image();
        img.src = `/dessert-frames/frame_${String(i).padStart(4, "0")}.png`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === TOTAL_DESSERT_FRAMES) setDessertFramesLoaded(true);
        };
        frames.push(img);
      }
      dessertFramesRef.current = frames;
      const first = frames[0];
      first.onload = () => {
        const canvas = dessertCanvasRef.current;
        if (canvas && first.complete) {
          canvas.width = first.naturalWidth;
          canvas.height = first.naturalHeight;
          const ctx = canvas.getContext("2d", { alpha: false });
          ctx?.drawImage(first, 0, 0, canvas.width, canvas.height);
        }
      };
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
        <div className="absolute inset-0 z-0 flex items-center px-6 sm:px-8 md:px-16 lg:px-24">
          <div className="text-left">
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
        className="relative"
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
        className="relative"
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
        {/* Top 70% - Text area */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center px-4 sm:px-6 md:px-8" style={{ height: "70%" }}>
          <div className="max-w-3xl space-y-3 sm:space-y-4 text-left">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
              I&apos;ve developed multiple systems involving preprocessing, denoising frameworks, feature extraction, and benchmarking pipelines using both classical and deep learning approaches. My specialization lies in signal processing, EEG denoising methods, and evaluating robust machine learning pipelines for neural decoding.
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
              These projects are part of a larger journey of learning, experimenting, and building toward something much bigger in the BCI space… stay tuned 😉
            </p>
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
        className="relative"
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
