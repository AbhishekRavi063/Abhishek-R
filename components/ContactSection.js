"use client";

import { useEffect, useRef } from "react";

const CLOUDS = [
  { src: "/herocloud.png", opacity: 0.38, scale: 1.4, x: "5%", y: "15%", phase: 0 },
  { src: "/cloud.png", opacity: 0.35, scale: 1.6, x: "75%", y: "20%", phase: 0.66 },
  { src: "/cloud.png", opacity: 0.32, scale: 1.3, x: "15%", y: "70%", phase: 1.33 },
  { src: "/herocloud.png", opacity: 0.36, scale: 1.5, x: "80%", y: "65%", phase: 2 },
  { src: "/cloud.png", opacity: 0.28, scale: 1.2, x: "50%", y: "85%", phase: 0.5 },
  { src: "/herocloud.png", opacity: 0.3, scale: 1.35, x: "40%", y: "10%", phase: 1.8 },
  { src: "/cloud.png", opacity: 0.25, scale: 1.15, x: "90%", y: "45%", phase: 1.1 },
  { src: "/herocloud.png", opacity: 0.33, scale: 1.25, x: "8%", y: "45%", phase: 2.2 },
  { src: "/cloud.png", opacity: 0.3, scale: 1.4, x: "60%", y: "75%", phase: 0.3 },
  { src: "/herocloud.png", opacity: 0.27, scale: 1.2, x: "25%", y: "35%", phase: 1.6 },
];

const CONTACTS = [
  { href: "https://wa.me/918281540004", label: "WhatsApp", icon: "wa", color: "#25D366" },
  { href: "mailto:abhishekravi063@gmail.com", label: "Email", icon: "mail", color: "#22d3ee" },
  { href: "https://www.linkedin.com/in/abhishek-r-2bab72278/", label: "LinkedIn", icon: "in", color: "#0ea5e9" },
  { href: "https://github.com/abhishekravi063", label: "GitHub", icon: "gh", color: "#e2e8f0" },
];

export default function ContactSection() {
  const contactRef = useRef(null);
  const cloudRefs = useRef([]);
  const hoverRef = useRef(false);
  const pushAmountRef = useRef(0);
  const sectionRef = useRef(null);
  const isVisibleRef = useRef(false);
  const rafIdRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pushLerpSpeed = 0.035;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;

      if (contactRef.current) {
        const yOffset = Math.sin(elapsed * 0.9) * 8;
        const xOffset = Math.sin(elapsed * 0.6 + 0.5) * 4;
        contactRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }

      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;
      const targetPush = isDesktop && hoverRef.current ? 40 : 0;
      pushAmountRef.current += (targetPush - pushAmountRef.current) * pushLerpSpeed;

      CLOUDS.forEach((cloud, i) => {
        const el = cloudRefs.current[i];
        if (el) {
          const cx = parseInt(cloud.x, 10) || 50;
          const cy = parseInt(cloud.y, 10) || 50;
          const dx = cx - 50;
          const dy = cy - 50;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const pushX = (dx / len) * pushAmountRef.current;
          const pushY = (dy / len) * pushAmountRef.current;

          const yOffset = Math.sin(elapsed * 0.35 + cloud.phase * Math.PI) * 25;
          const xOffset = Math.cos(elapsed * 0.28 + cloud.phase * 0.7) * 20;
          const totalX = xOffset + pushX;
          const totalY = yOffset + pushY;
          el.style.transform = `translate(calc(-50% + ${totalX}px), calc(-50% + ${totalY}px)) scale(${cloud.scale})`;
        }
      });

      // Only continue loop if section is visible
      if (isVisibleRef.current) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    // Use IntersectionObserver to start/stop the loop
    const sectionEl = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );
    if (sectionEl) observer.observe(sectionEl);

    return () => {
      observer.disconnect();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/fogforest.jpg)" }}
      />

      {/* Floating clouds layer - behind contact div */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {CLOUDS.map((cloud, i) => (
          <img
            key={`${cloud.src}-${i}`}
            ref={(el) => { cloudRefs.current[i] = el; }}
            src={cloud.src}
            alt=""
            loading="lazy"
            className="absolute object-contain"
            style={{
              left: cloud.x,
              top: cloud.y,
              opacity: cloud.opacity,
              maxWidth: "45%",
              maxHeight: "50%",
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Glassy div with socials - floating animation, above clouds */}
      <div
        ref={contactRef}
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
        className="relative z-20 px-4 sm:px-6 md:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl cursor-pointer transition-shadow duration-700 ease-in-out mx-4 sm:mx-6 sm:hover:shadow-[0_0_0_2px_rgba(255,255,255,0.4),0_0_25px_rgba(255,255,255,0.2),0_0_50px_rgba(255,255,255,0.1)]"
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {CONTACTS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.icon !== "mail" ? "_blank" : undefined}
              rel={c.icon !== "mail" ? "noopener noreferrer" : undefined}
              className="flex items-center justify-center p-2 sm:p-3 rounded-xl transition-all duration-300 sm:hover:bg-white/10 sm:hover:scale-110 cursor-pointer"
              aria-label={c.label}
            >
              {c.icon === "wa" && (
                <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill={c.color}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              )}
              {c.icon === "mail" && (
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke={c.color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {c.icon === "in" && (
                <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill={c.color}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              )}
              {c.icon === "gh" && (
                <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill={c.color}>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
