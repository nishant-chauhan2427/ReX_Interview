import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
}

const PARTICLE_COUNT = 150;
const ATTRACT_RADIUS = 180;
const REPEL_RADIUS = 65;
const LINE_RADIUS = 120;
const CURSOR_LINE_RADIUS = 150;

export function ParticleCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isDarkRef = useRef(isDark);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  isDarkRef.current = isDark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particlesRef.current.push({
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 1,
        });
      }
    };

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const col = isDarkRef.current ? "255,255,255" : "50,70,140";
      const particles = particlesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      // Update + draw particles
      particles.forEach((p) => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ATTRACT_RADIUS && dist > REPEL_RADIUS) {
          // Attract toward cursor
          const force = ((ATTRACT_RADIUS - dist) / ATTRACT_RADIUS) * 0.045;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        } else if (dist < REPEL_RADIUS && dist > 0) {
          // Repel away from cursor
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.18;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }

        // Drift back to origin
        p.vx += (p.ox - p.x) * 0.003;
        p.vy += (p.oy - p.y) * 0.003;

        // Damping
        p.vx *= 0.93;
        p.vy *= 0.93;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.35)`;
        ctx.fill();
      });

      // Particle-to-particle lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_RADIUS) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${col},${0.07 * (1 - dist / LINE_RADIUS)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Particle-to-cursor lines
        const cdx = particles[i].x - mx;
        const cdy = particles[i].y - my;
        const cd = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cd < CURSOR_LINE_RADIUS) {
          const alpha = (1 - cd / CURSOR_LINE_RADIUS) * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(${col},${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const handleResize = () => {
      resize();
      initParticles();
    };

    resize();
    initParticles();
    draw();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}