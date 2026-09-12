"use client";

import { useEffect, useRef } from "react";

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  background?: string;
  options?: Record<string, unknown>;
}

export function Sparkles({
  className,
  size = 1.4,
  density = 40,
  speed = 0.4,
  opacity = 0.8,
  color = "#FFFFFF",
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = false;

    // Keep particle count low on mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const particleCount = isMobile
      ? Math.min(density, 25)
      : Math.min(density, 50);

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    interface Particle {
      x: number;
      y: number;
      r: number;
      alpha: number;
      alphaSpeed: number;
      vy: number;
      vx: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * size + 0.5,
        alpha: Math.random() * opacity + 0.1,
        alphaSpeed:
          (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        vy: -(Math.random() * speed + 0.1),
        vx: (Math.random() - 0.5) * speed * 0.5,
      });
    }

    const render = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += p.alphaSpeed;

        if (p.alpha <= 0.1 || p.alpha >= opacity) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        // Wrap boundaries
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause rendering entirely when outside viewport (zero mobile CPU / main-thread penalty)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    // Responsive resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [color, density, opacity, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: "none", display: "block" }}
    />
  );
}
