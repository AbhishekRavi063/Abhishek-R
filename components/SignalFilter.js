"use client";

import { useEffect, useRef, useState } from "react";

export default function SignalFilter() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef(null);
  
  // Filter controls
  const [lowCut, setLowCut] = useState(0.5);
  const [highCut, setHighCut] = useState(40);

  const isVisibleRef = useRef(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let width = container.offsetWidth;
    let height = container.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    const BUFFER_SIZE = 800;
    
    // Channel data
    const channel = {
      signal: new Array(BUFFER_SIZE).fill(0),
      // Multiple filter states for cascaded filtering
      hpState: { x1: 0, x2: 0, y1: 0, y2: 0 },
      lpState: { x1: 0, x2: 0, y1: 0, y2: 0 },
      notchState: { x1: 0, x2: 0, y1: 0, y2: 0 },
      // EEG rhythm phases
      delta: Math.random() * Math.PI * 2,
      theta: Math.random() * Math.PI * 2,
      alpha: Math.random() * Math.PI * 2,
      beta: Math.random() * Math.PI * 2,
      gamma: Math.random() * Math.PI * 2,
      // Noise phases
      noisePhase: Math.random() * 100,
      driftPhase: Math.random() * 10,
      // Artifact state
      artifactTimer: Math.random() * 150,
      currentArtifact: 0,
      artifactDecay: 0,
      emgBurst: 0,
      emgDecay: 0,
    };

    // Generate realistic raw EEG sample
    const generateRawSample = () => {
      const c = channel;
      
      // Delta (0.5-4 Hz) - slow, high amplitude
      c.delta += 0.006 + Math.random() * 0.002;
      // Theta (4-8 Hz)
      c.theta += 0.03 + Math.random() * 0.005;
      // Alpha (8-13 Hz) - dominant when relaxed
      c.alpha += 0.055 + Math.random() * 0.008;
      // Beta (13-30 Hz)
      c.beta += 0.11 + Math.random() * 0.02;
      // Gamma (30-100 Hz)
      c.gamma += 0.25 + Math.random() * 0.05;
      
      // Combine rhythms with realistic amplitude ratios
      let signal = 
        Math.sin(c.delta) * 40 +
        Math.sin(c.delta * 1.8) * 25 +
        Math.sin(c.theta) * 20 +
        Math.sin(c.theta * 1.5) * 12 +
        Math.sin(c.alpha) * 50 +
        Math.sin(c.alpha * 1.15) * 30 +
        Math.sin(c.alpha * 0.85) * 25 +
        Math.sin(c.beta) * 10 +
        Math.sin(c.beta * 1.6) * 6 +
        Math.sin(c.gamma) * 4 +
        Math.sin(c.gamma * 1.3) * 2;

      // Pink noise (1/f)
      c.noisePhase += 0.1;
      const pinkNoise = 
        (Math.random() - 0.5) * 18 +
        Math.sin(c.noisePhase * 0.4) * 10 +
        Math.sin(c.noisePhase * 1.8) * 5 +
        Math.sin(c.noisePhase * 7) * 3;
      
      // 50/60 Hz power line interference (strong)
      const lineNoise = Math.sin(c.noisePhase * 3.14) * 20 + 
                        Math.sin(c.noisePhase * 3.14 * 2) * 8; // harmonics
      
      // EMG artifacts (muscle)
      if (Math.random() > 0.994) {
        c.emgBurst = 50 + Math.random() * 70;
        c.emgDecay = 1;
      }
      c.emgDecay *= 0.9;
      const emg = c.emgBurst * c.emgDecay * (Math.random() - 0.5) * 2;
      
      // Eye blink artifacts
      c.artifactTimer++;
      if (c.artifactTimer > 180 + Math.random() * 300) {
        c.artifactTimer = 0;
        c.currentArtifact = (Math.random() > 0.5 ? 1 : -1) * (100 + Math.random() * 120);
        c.artifactDecay = 1;
      }
      c.artifactDecay *= 0.93;
      const eyeBlink = c.currentArtifact * c.artifactDecay * 
        Math.exp(-Math.pow(c.artifactDecay - 0.6, 2) * 8);

      // Electrode pop
      const electrodePop = Math.random() > 0.997 ? (Math.random() - 0.5) * 180 : 0;
      
      // Baseline drift (very low frequency)
      c.driftPhase += 0.0008;
      const drift = Math.sin(c.driftPhase) * 20 + Math.sin(c.driftPhase * 0.3) * 15;

      return signal + pinkNoise + lineNoise + emg + eyeBlink + electrodePop + drift;
    };

    // Biquad filter implementation
    const biquadFilter = (input, state, b0, b1, b2, a1, a2) => {
      const output = b0 * input + b1 * state.x1 + b2 * state.x2 - a1 * state.y1 - a2 * state.y2;
      state.x2 = state.x1;
      state.x1 = input;
      state.y2 = state.y1;
      state.y1 = output;
      return output;
    };

    // Calculate high-pass filter coefficients
    const getHighPassCoeffs = (cutoff, sampleRate = 256) => {
      const w0 = 2 * Math.PI * cutoff / sampleRate;
      const alpha = Math.sin(w0) / (2 * 0.707);
      const cosw0 = Math.cos(w0);
      
      const b0 = (1 + cosw0) / 2;
      const b1 = -(1 + cosw0);
      const b2 = (1 + cosw0) / 2;
      const a0 = 1 + alpha;
      const a1 = -2 * cosw0;
      const a2 = 1 - alpha;
      
      return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
    };

    // Calculate low-pass filter coefficients
    const getLowPassCoeffs = (cutoff, sampleRate = 256) => {
      const w0 = 2 * Math.PI * cutoff / sampleRate;
      const alpha = Math.sin(w0) / (2 * 0.707);
      const cosw0 = Math.cos(w0);
      
      const b0 = (1 - cosw0) / 2;
      const b1 = 1 - cosw0;
      const b2 = (1 - cosw0) / 2;
      const a0 = 1 + alpha;
      const a1 = -2 * cosw0;
      const a2 = 1 - alpha;
      
      return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
    };

    let time = 0;
    const dividerX = width / 2;

    const render = () => {
      time += 0.016;

      // Generate new sample
      const newSample = generateRawSample();
      channel.signal.pop();
      channel.signal.unshift(newSample);

      // Clear canvas
      ctx.fillStyle = "rgba(8, 8, 16, 0.98)";
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      const signalScale = 0.3;
      const dividerIdx = Math.floor(BUFFER_SIZE * (1 - dividerX / width));

      // Get current filter coefficients
      const hpCoeffs = getHighPassCoeffs(lowCut);
      const lpCoeffs = getLowPassCoeffs(highCut);

      // Reset filter states for render pass
      const tempHpState = { x1: 0, x2: 0, y1: 0, y2: 0 };
      const tempLpState = { x1: 0, x2: 0, y1: 0, y2: 0 };

      // === RIGHT SIDE: Raw noisy signal ===
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < dividerIdx; i++) {
        const x = width - (i / BUFFER_SIZE) * width;
        if (x < dividerX) break;
        const y = centerY + channel.signal[i] * signalScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Noise ghost
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 100, 100, 0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i < dividerIdx; i++) {
        const x = width - (i / BUFFER_SIZE) * width;
        if (x < dividerX) break;
        const y = centerY + channel.signal[i] * signalScale * 1.15;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // === LEFT SIDE: Filtered signal ===
      // Pre-warm filters
      for (let i = Math.min(dividerIdx + 30, BUFFER_SIZE - 1); i >= dividerIdx; i--) {
        let sample = channel.signal[i];
        sample = biquadFilter(sample, tempHpState, hpCoeffs.b0, hpCoeffs.b1, hpCoeffs.b2, hpCoeffs.a1, hpCoeffs.a2);
        sample = biquadFilter(sample, tempLpState, lpCoeffs.b0, lpCoeffs.b1, lpCoeffs.b2, lpCoeffs.a1, lpCoeffs.a2);
      }

      ctx.beginPath();
      ctx.strokeStyle = "rgba(100, 255, 150, 1)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(100, 255, 150, 0.5)";
      ctx.shadowBlur = 6;

      let started = false;
      for (let i = dividerIdx; i < BUFFER_SIZE; i++) {
        const x = width - (i / BUFFER_SIZE) * width;
        if (x > dividerX) continue;
        
        let sample = channel.signal[i];
        // Apply bandpass (HP + LP)
        sample = biquadFilter(sample, tempHpState, hpCoeffs.b0, hpCoeffs.b1, hpCoeffs.b2, hpCoeffs.a1, hpCoeffs.a2);
        sample = biquadFilter(sample, tempLpState, lpCoeffs.b0, lpCoeffs.b1, lpCoeffs.b2, lpCoeffs.a1, lpCoeffs.a2);
        
        const y = centerY + sample * signalScale * 0.6;
        
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // === CENTER DIVIDER ===
      ctx.strokeStyle = "rgba(150, 180, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(100, 150, 255, 0.7)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(dividerX, 0);
      ctx.lineTo(dividerX, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glow
      const glowGrad = ctx.createLinearGradient(dividerX - 25, 0, dividerX + 25, 0);
      glowGrad.addColorStop(0, "rgba(100, 150, 255, 0)");
      glowGrad.addColorStop(0.5, "rgba(100, 150, 255, 0.12)");
      glowGrad.addColorStop(1, "rgba(100, 150, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(dividerX - 25, 0, 50, height);

      // Labels
      ctx.fillStyle = "rgba(255, 120, 120, 0.9)";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "right";
      ctx.fillText("RAW", width - 10, 18);

      ctx.fillStyle = "rgba(100, 255, 150, 0.9)";
      ctx.textAlign = "left";
      ctx.fillText("FILTERED", 10, 18);

      if (isVisibleRef.current) rafRef.current = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, lowCut, highCut]);

  const presets = [
    { label: "Alpha", hp: 8, lp: 13, hint: "8–13 Hz · relaxation" },
    { label: "Beta", hp: 13, lp: 30, hint: "13–30 Hz · focus" },
    { label: "Theta", hp: 4, lp: 8, hint: "4–8 Hz · meditation" },
    { label: "Full", hp: 0.5, lp: 40, hint: "0.5–40 Hz · broadband" },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Preset buttons + Controls */}
      <div className="flex flex-col gap-3 px-3 sm:px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {presets.map((p) => {
            const isActive = Math.abs(lowCut - p.hp) < 0.3 && Math.abs(highCut - p.lp) < 1;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => { setLowCut(p.hp); setHighCut(p.lp); }}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/50"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20"
                }`}
                title={p.hint}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-medium">HP</span>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={lowCut}
              onChange={(e) => setLowCut(parseFloat(e.target.value))}
              className="w-20 md:w-28 cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(34, 211, 238) 0%, rgb(34, 211, 238) ${(lowCut / 20) * 100}%, rgba(255,255,255,0.15) ${(lowCut / 20) * 100}%, rgba(255,255,255,0.15) 100%)`
              }}
            />
            <span className="text-xs text-cyan-300 font-mono w-14">{lowCut.toFixed(1)} Hz</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-blue-400 font-medium">LP</span>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={highCut}
              onChange={(e) => setHighCut(parseFloat(e.target.value))}
              className="w-20 md:w-28 cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(96, 165, 250) 0%, rgb(96, 165, 250) ${((highCut - 5) / 95) * 100}%, rgba(255,255,255,0.15) ${((highCut - 5) / 95) * 100}%, rgba(255,255,255,0.15) 100%)`
              }}
            />
            <span className="text-xs text-blue-300 font-mono w-12">{highCut} Hz</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
