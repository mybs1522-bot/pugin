"use client";

import React, { useState, useEffect, useRef } from "react";

interface PhotoCardProps {
  src: string;
  alt: string;
  rotation: number;
  label: string;
  index: number;
  style?: React.CSSProperties;
  isActive: boolean;
}

const PhotoCard = ({
  src,
  alt,
  rotation,
  label,
  index,
  style = {},
  isActive,
}: PhotoCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400 + index * 250);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="bg-background/40 border-border/40 absolute h-[190px] w-[130px] rounded-md border p-1.5 shadow-lg backdrop-blur-sm sm:h-[220px] sm:w-[150px] sm:p-2 lg:h-[300px] lg:w-[210px]"
      style={{
        transform: `rotate(${rotation}deg) scale(${isActive ? 1.07 : 1})`,
        zIndex: isActive ? 20 : 1,
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: isVisible ? 1 : 0,
        ...style,
      }}
    >
      <div className="relative h-[82%] w-full overflow-hidden rounded-sm">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/150x180/e2e8f0/94a3b8?text=Image";
          }}
        />
        <span
          className={`absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
            label === "After"
              ? "bg-green-600 text-white"
              : "bg-black/60 text-white"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex h-[18%] items-center justify-center">
        <p className="text-muted-foreground truncate px-1 text-center text-[10px] font-medium">
          {label === "After" ? "Render" : "Design"}
        </p>
      </div>
    </div>
  );
};

const AnimatedGrid = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <div
        className="absolute inset-0 animate-[grid-scroll_3.2s_linear_infinite]"
        style={{
          background: `
            linear-gradient(rgba(156,163,175,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156,163,175,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, black 30%, transparent 75%)",
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes grid-scroll {
          from { background-position: 0 0, 0 0; }
          to { background-position: 40px 40px, 40px 40px; }
        }
      `,
        }}
      />
    </div>
  );
};

export function BeforeAfterCards() {
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!interval) {
            interval = setInterval(() => {
              setActiveIndex((prev) => (prev === 0 ? 1 : 0));
            }, 1500);
          }
        } else if (interval) {
          clearInterval(interval);
          interval = null;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[260px] w-[280px] items-center justify-center sm:h-[300px] sm:w-[300px] lg:h-[440px] lg:w-[440px]"
    >
      <AnimatedGrid />

      {/* Before card */}
      <PhotoCard
        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80"
        alt="Before: plain room"
        rotation={-10}
        label="Before"
        index={0}
        isActive={activeIndex === 0}
        style={{ top: "28px", left: "10px" }}
      />

      {/* After card */}
      <PhotoCard
        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80"
        alt="After: Photorealistic rendered room"
        rotation={10}
        label="After"
        index={1}
        isActive={activeIndex === 1}
        style={{ top: "14px", right: "10px" }}
      />
    </div>
  );
}
