"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadPricingModal } from "@/components/ui/download-pricing-modal";
import { PlatformBadge } from "@/components/ui/platform-icons";
import { Play } from "lucide-react";
import { BeforeAfterCards } from "@/components/ui/3d-card";

export function LiveDemoSection() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoError) return;
    video.muted = true;
    video.defaultMuted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy or low battery restricted
          setIsPlaying(false);
        });
    }
  }, [videoError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    attemptPlay();

    // IntersectionObserver: autoplay when in view, pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attemptPlay();
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Passive gesture fallback for iOS Low Power Mode or aggressive battery-saver
    const triggerOnGesture = () => {
      attemptPlay();
    };

    window.addEventListener("touchstart", triggerOnGesture, {
      once: true,
      passive: true,
    });
    window.addEventListener("scroll", triggerOnGesture, {
      once: true,
      passive: true,
    });
    window.addEventListener("pointerdown", triggerOnGesture, {
      once: true,
      passive: true,
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("touchstart", triggerOnGesture);
      window.removeEventListener("scroll", triggerOnGesture);
      window.removeEventListener("pointerdown", triggerOnGesture);
    };
  }, [attemptPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      attemptPlay();
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <DownloadPricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      <section className="py-2">
        <div className="relative mx-auto w-full max-w-4xl">
          {/* Pill overlapping video top border */}
          <div className="relative z-20 -mb-3 flex justify-center sm:-mb-3.5">
            <div className="rounded-full border border-white/20 bg-zinc-950/95 px-3.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-lg backdrop-blur-md select-none sm:text-xs md:text-sm">
              Sketchup To Render In Few Clicks
            </div>
          </div>

          {/* Video Container */}
          <div
            ref={containerRef}
            className="group relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black/90 shadow-2xl"
          >
            <div
              style={{ position: "relative", paddingTop: "56.25%" }}
              onClick={togglePlay}
              className="cursor-pointer"
            >
              {!videoError ? (
                <>
                  <video
                    ref={videoRef}
                    src="/live-demo.mp4"
                    poster="/live-demo-poster.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    disableRemotePlayback
                    controls={false}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={() => setVideoError(true)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* Play button overlay when paused */}
                  <AnimatePresence>
                    {!isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/20 shadow-2xl backdrop-blur-md sm:h-16 sm:w-16">
                          <Play className="ml-1 h-6 w-6 fill-white text-white sm:h-7 sm:w-7" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                /* Fallback to BunnyCDN iframe if video fails */
                <iframe
                  src="https://iframe.mediadelivery.net/embed/494628/68bbd0f4-e435-478c-af0d-8cd95b3a96a1?autoplay=true&loop=true&muted=true&preload=true&responsive=true&playsinline=true"
                  loading="eager"
                  style={{
                    border: 0,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                  }}
                  allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; accelerometer; gyroscope"
                  allowFullScreen
                  title="V6 Render SketchUp Walkthrough Video"
                />
              )}
            </div>
          </div>

          {/* CTA Below Video */}
          <div className="mt-4 flex flex-col items-center justify-center px-4 sm:mt-5">
            {/* Windows & Mac icons above CTA */}
            <PlatformBadge className="mb-2" />

            {/* 3D Rectangular Tactile CTA Button */}
            <motion.button
              onClick={() => setPricingOpen(true)}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ y: 2, scale: 0.99 }}
              className="group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-b-[4px] border-zinc-700/80 border-b-black bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 px-6 py-2.5 text-xs font-bold tracking-wide text-white shadow-[0_6px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all select-none hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:brightness-110 active:border-b-[2px] active:shadow-[0_2px_8px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:px-8 sm:py-3 sm:text-sm"
            >
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Download Plugin
              </span>
            </motion.button>

            {/* Subtext */}
            <p className="text-muted-foreground mt-2 text-center text-[11px] font-medium sm:text-xs">
              14-Day Free Trial · Cancel anytime
            </p>

            {/* Before / After Cards */}
            <div className="mt-4 flex justify-center sm:mt-6">
              <BeforeAfterCards />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
