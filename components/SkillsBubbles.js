"use client";

import { useEffect, useRef, useState } from "react";

const SKILLS = [
  { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Django", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
  { name: "FastAPI", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
  { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Three.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" },
  { name: "TensorFlow", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "PyTorch", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
  { name: "HTML", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "Cloudflare", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg" },
  { name: "Supabase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
  { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  { name: "Pinecone", logo: "https://images.seeklogo.com/logo-png/48/1/pinecone-icon-logo-png_seeklogo-482365.png" },
  { name: "Postman", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
  { name: "Insomnia", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/insomnia/insomnia-original.svg" },
  { name: "Matter.js", logo: "https://brm.io/matter-js/img/matter-js.svg" },
  { name: "GSAP", logo: "https://cdn.worldvectorlogo.com/logos/gsap-greensock.svg" },
];

const loadedImages = {};

export default function SkillsBubbles() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const draggedBodyRef = useRef(null);
  const rafRef = useRef(null);
  const isVisibleRef = useRef(false);
  const renderFnRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0, rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || typeof window === "undefined") return;

    let Matter;
    let cleanup = () => {};

    (async () => {
      Matter = (await import("matter-js")).default;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      const engine = Matter.Engine.create({
        gravity: { x: 0, y: 0 },
      });
      engineRef.current = engine;

      const wallThickness = 50;
      const walls = [
        Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
        Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
      ];


      const spinnerRadius = Math.min(50, Math.min(width, height) * 0.12);
      const leafCount = 3;
      let spinnerAngle = 0;
      let spinnerSpeed = 0.02;

      const spinnerOffset = Math.min(160, width * 0.22);
      const spinnerLeftX = spinnerOffset;
      const spinnerRightX = width - spinnerOffset;
      const spinnerY = height / 2;

      const spinnerLeftBody = Matter.Bodies.circle(spinnerLeftX, spinnerY, spinnerRadius, {
        isStatic: true,
        isSensor: true,
        label: "spinner",
      });
      const spinnerRightBody = Matter.Bodies.circle(spinnerRightX, spinnerY, spinnerRadius, {
        isStatic: true,
        isSensor: true,
        label: "spinner",
      });
      Matter.Composite.add(engine.world, [spinnerLeftBody, spinnerRightBody]);

      const spinners = [
        { x: spinnerLeftX, y: spinnerY, radius: spinnerRadius, leafCount, rotation: 1 },
        { x: spinnerRightX, y: spinnerY, radius: spinnerRadius, leafCount, rotation: -1 },
      ];

      // Create "SKILLS" text as physics bodies - use thin strokes to match letter shapes
      const skillsText = "SKILLS";
      const isMobile = width < 640;
      const fontSize = isMobile ? height * 0.09 : height * 0.13;
      const letterSpacing = isMobile ? width * 0.11 : width * 0.09;
      const strokeWidth = fontSize * 0.15; // thin stroke width
      const startX = (width - (skillsText.length - 1) * letterSpacing) / 2;
      const textY = height / 2;

      const letterBodies = [];
      const letterVisuals = [];

      // Create collision bodies for each letter's strokes
      const createLetterBodies = (letter, cx, cy) => {
        const h = fontSize;
        const w = fontSize * 0.6;
        const sw = strokeWidth;
        const bodies = [];

        switch (letter) {
          case 'S':
            // S shape - top curve, middle, bottom curve (simplified as 3 horizontal bars)
            bodies.push(Matter.Bodies.rectangle(cx, cy - h * 0.35, w * 0.7, sw, { isStatic: true }));
            bodies.push(Matter.Bodies.rectangle(cx, cy, w * 0.5, sw, { isStatic: true }));
            bodies.push(Matter.Bodies.rectangle(cx, cy + h * 0.35, w * 0.7, sw, { isStatic: true }));
            break;
          case 'K':
            // K shape - vertical line + two diagonals
            bodies.push(Matter.Bodies.rectangle(cx - w * 0.25, cy, sw, h, { isStatic: true }));
            bodies.push(Matter.Bodies.rectangle(cx + w * 0.1, cy - h * 0.2, sw, h * 0.5, { isStatic: true, angle: Math.PI * 0.2 }));
            bodies.push(Matter.Bodies.rectangle(cx + w * 0.1, cy + h * 0.2, sw, h * 0.5, { isStatic: true, angle: -Math.PI * 0.2 }));
            break;
          case 'I':
            // I shape - just a vertical line
            bodies.push(Matter.Bodies.rectangle(cx, cy, sw, h, { isStatic: true }));
            break;
          case 'L':
            // L shape - vertical + horizontal
            bodies.push(Matter.Bodies.rectangle(cx - w * 0.15, cy, sw, h, { isStatic: true }));
            bodies.push(Matter.Bodies.rectangle(cx + w * 0.1, cy + h * 0.4, w * 0.5, sw, { isStatic: true }));
            break;
          default:
            bodies.push(Matter.Bodies.rectangle(cx, cy, w * 0.5, h, { isStatic: true }));
        }
        return bodies;
      };

      for (let i = 0; i < skillsText.length; i++) {
        const letterX = startX + i * letterSpacing;
        const bodies = createLetterBodies(skillsText[i], letterX, textY);
        bodies.forEach(b => {
          b.letter = skillsText[i];
          b.restitution = 0.9;
        });
        letterBodies.push(...bodies);
        letterVisuals.push({ letter: skillsText[i], x: letterX, y: textY });
      }
      // On mobile: skip letter collision bodies so bubbles pass through; keep text as visual background only
      if (!isMobile) {
        Matter.Composite.add(engine.world, letterBodies);
      }

      const baseRadius = isMobile ? Math.min(width, height) * 0.065 : Math.min(width, height) * 0.04;

      const bubbles = SKILLS.map((skill) => {
        const textLen = skill.name.length;
        const radius = baseRadius + textLen * 1 + Math.random() * 4;
        const x = radius + Math.random() * (width - radius * 2);
        const y = radius + Math.random() * (height * 0.5);

        const body = Matter.Bodies.circle(x, y, radius, {
          restitution: 0.85,
          friction: 0,
          frictionAir: 0.001,
          label: skill.name,
        });

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.12 + Math.random() * 0.1;
        Matter.Body.setVelocity(body, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
        body.skill = skill;
        body.radius = radius;

        if (!loadedImages[skill.logo]) {
          const img = new Image();
          img.src = skill.logo;
          loadedImages[skill.logo] = img;
        }

        return body;
      });
      bodiesRef.current = bubbles;

      Matter.Composite.add(engine.world, [...walls, ...bubbles]);

      const getMousePos = (e) => {
        const rect = container.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };

      const findBodyAtPos = (x, y) => {
        for (const body of bubbles) {
          const dx = body.position.x - x;
          const dy = body.position.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < body.radius) {
            return body;
          }
        }
        return null;
      };

      const handleMouseMove = (e) => {
        const pos = getMousePos(e);
        mouseRef.current.x = pos.x;
        mouseRef.current.y = pos.y;

        if (mouseRef.current.isDown && draggedBodyRef.current) {
          Matter.Body.setPosition(draggedBodyRef.current, pos);
          Matter.Body.setVelocity(draggedBodyRef.current, { x: 0, y: 0 });
        }
      };

      const handleMouseDown = (e) => {
        const pos = getMousePos(e);
        const body = findBodyAtPos(pos.x, pos.y);
        if (body) {
          mouseRef.current.isDown = true;
          draggedBodyRef.current = body;
          Matter.Body.setStatic(body, true);
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleMouseUp = () => {
        if (draggedBodyRef.current) {
          Matter.Body.setStatic(draggedBodyRef.current, false);
          const vx = (Math.random() - 0.5) * 1.2;
          const vy = (Math.random() - 0.5) * 1.2;
          Matter.Body.setVelocity(draggedBodyRef.current, { x: vx, y: vy });
        }
        mouseRef.current.isDown = false;
        draggedBodyRef.current = null;
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);

      const minSpeed = 0.1;

      const render = () => {
        Matter.Engine.update(engine, 1000 / 60);

        spinnerAngle += spinnerSpeed;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        bubbles.forEach((body) => {
          if (body.isStatic) return;

          const dx = body.position.x - mx;
          const dy = body.position.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 0) {
            const force = 0.0006 * (150 - dist);
            Matter.Body.applyForce(body, body.position, {
              x: (dx / dist) * force,
              y: (dy / dist) * force,
            });
          }

          spinners.forEach((spinner) => {
            const sdx = body.position.x - spinner.x;
            const sdy = body.position.y - spinner.y;
            const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
            const hitRadius = spinner.radius + body.radius;

            if (sDist < hitRadius && sDist > 0) {
              spinnerSpeed = Math.min(0.12, spinnerSpeed + 0.008);

              const throwAngle = spinner.rotation * spinnerAngle + Math.PI / 2;
              const throwSpeed = 3 + spinnerSpeed * 35;
              Matter.Body.setVelocity(body, {
                x: Math.cos(throwAngle) * throwSpeed,
                y: Math.sin(throwAngle) * throwSpeed,
              });

              const pushOut = hitRadius - sDist + 5;
              Matter.Body.setPosition(body, {
                x: body.position.x + (sdx / sDist) * pushOut,
                y: body.position.y + (sdy / sDist) * pushOut,
              });
            }
          });

          const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
          if (speed < minSpeed && speed > 0) {
            const scale = minSpeed / speed;
            Matter.Body.setVelocity(body, {
              x: body.velocity.x * scale,
              y: body.velocity.y * scale,
            });
          }
        });

        spinnerSpeed = Math.max(0.02, spinnerSpeed * 0.995);

        ctx.clearRect(0, 0, width, height);

        // Draw "SKILLS" text with shiny glassy effect (on mobile: lower opacity as background, bubbles pass over)
        ctx.save();
        ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (isMobile) ctx.globalAlpha = 0.35;

        letterVisuals.forEach((lv) => {
          // Crystal/glass base with visible fill
          ctx.shadowColor = "rgba(100, 150, 220, 0.4)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Glass gradient - more visible
          const gradient = ctx.createLinearGradient(
            lv.x - fontSize * 0.3, lv.y - fontSize * 0.5,
            lv.x + fontSize * 0.3, lv.y + fontSize * 0.5
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.35)");
          gradient.addColorStop(0.2, "rgba(200, 220, 255, 0.25)");
          gradient.addColorStop(0.5, "rgba(180, 200, 240, 0.2)");
          gradient.addColorStop(0.8, "rgba(200, 220, 255, 0.25)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.35)");

          ctx.fillStyle = gradient;
          ctx.fillText(lv.letter, lv.x, lv.y);

          // Crystal edge stroke
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
          ctx.lineWidth = 2;
          ctx.strokeText(lv.letter, lv.x, lv.y);

          // Top highlight for glass refraction effect
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1;
          ctx.strokeText(lv.letter, lv.x, lv.y - 1.5);

          // Bottom shadow for depth
          ctx.fillStyle = "rgba(100, 130, 180, 0.15)";
          ctx.fillText(lv.letter, lv.x + 1, lv.y + 1);
        });
        ctx.restore();

        spinners.forEach((spinner) => {
          ctx.save();
          ctx.translate(spinner.x, spinner.y);
          ctx.rotate(spinner.rotation * spinnerAngle);

          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          const hubGradient = ctx.createRadialGradient(0, -3, 0, 0, 0, 10);
          hubGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          hubGradient.addColorStop(0.5, "rgba(200, 200, 210, 0.85)");
          hubGradient.addColorStop(1, "rgba(150, 150, 160, 0.8)");
          ctx.fillStyle = hubGradient;
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          ctx.fill();
          ctx.shadowColor = "transparent";

          for (let i = 0; i < spinner.leafCount; i++) {
            const bladeAngle = (i / spinner.leafCount) * Math.PI * 2;
            ctx.save();
            ctx.rotate(bladeAngle);

            ctx.beginPath();
            ctx.moveTo(8, -3);
            ctx.lineTo(spinner.radius - 2, -6);
            ctx.quadraticCurveTo(spinner.radius + 4, 0, spinner.radius - 2, 6);
            ctx.lineTo(8, 3);
            ctx.closePath();

            const bladeGradient = ctx.createLinearGradient(8, 0, spinner.radius, 0);
            bladeGradient.addColorStop(0, "rgba(180, 180, 190, 0.9)");
            bladeGradient.addColorStop(0.5, "rgba(220, 220, 230, 0.95)");
            bladeGradient.addColorStop(1, "rgba(200, 200, 210, 0.85)");
            ctx.fillStyle = bladeGradient;
            ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;
            ctx.fill();
            ctx.shadowColor = "transparent";

            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
          }

          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(100, 100, 110, 0.9)";
          ctx.fill();

          ctx.restore();
        });

        bubbles.forEach((body) => {
          const { x, y } = body.position;
          const r = body.radius;
          const skill = body.skill;

          ctx.save();
          ctx.translate(x, y);

          const gradient = ctx.createRadialGradient(0, -r * 0.3, 0, 0, 0, r);
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          gradient.addColorStop(0.5, "rgba(240, 240, 245, 0.9)");
          gradient.addColorStop(1, "rgba(220, 225, 235, 0.85)");

          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;

          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.shadowColor = "transparent";

          ctx.beginPath();
          ctx.arc(-r * 0.25, -r * 0.3, r * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fill();

          const logoMaxSize = isMobile ? Math.max(r * 0.6, 18) : r * 0.55;
          const img = loadedImages[skill.logo];
          if (img && img.complete && img.naturalWidth > 0) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let logoWidth, logoHeight;
            if (aspectRatio > 1) {
              // Wider than tall
              logoWidth = logoMaxSize;
              logoHeight = logoMaxSize / aspectRatio;
            } else {
              // Taller than wide or square
              logoHeight = logoMaxSize;
              logoWidth = logoMaxSize * aspectRatio;
            }
            const logoX = -logoWidth / 2;
            const logoY = -r * 0.3 + (logoMaxSize - logoHeight) / 2;
            ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
          }

          ctx.fillStyle = "#1a1a2e";
          const fontSize = isMobile ? Math.max(r * 0.3, 10) : r * 0.26;
          ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(skill.name, 0, -r * 0.3 + logoMaxSize + 6);

          ctx.restore();
        });

        if (isVisibleRef.current) rafRef.current = requestAnimationFrame(render);
      };
      renderFnRef.current = render;

      // Resume animation when scrolling back into view
      const resumeInterval = setInterval(() => {
        if (isVisibleRef.current && !rafRef.current && renderFnRef.current) {
          renderFnRef.current();
        }
      }, 300);

      render();

      cleanup = () => {
        clearInterval(resumeInterval);
        cancelAnimationFrame(rafRef.current);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
        Matter.Engine.clear(engine);
        Matter.Composite.clear(engine.world);
      };
    })();

    return () => cleanup();
  }, [isVisible]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-pointer" />
    </div>
  );
}
