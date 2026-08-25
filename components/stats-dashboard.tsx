"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { MarketingDashboard } from "@/components/ui/dashboard-1";

export function StatsDashboard() {
  const router = useRouter();
  const [userCount, setUserCount] = useState(32550);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout>;
    let active = false;
    const schedule = () => {
      if (!active) return;
      const delay = 2500 + Math.random() * 2000;
      timeout = setTimeout(() => {
        setUserCount((n) => n + Math.floor(Math.random() * 2) + 2);
        schedule();
      }, delay);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          active = true;
          schedule();
        } else if (!entry.isIntersecting) {
          active = false;
          clearTimeout(timeout);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex justify-center">
      <MarketingDashboard
        title="Loved by 32,000+ SketchUp Designers in 90+ Countries"
        team={{
          memberCount: userCount,
          label: "Active Users",
          members: [
            {
              id: "1",
              name: "Aria Shah",
              avatarUrl: "https://i.pravatar.cc/150?u=ariashah",
            },
            {
              id: "2",
              name: "Leo Park",
              avatarUrl: "https://i.pravatar.cc/150?u=leopark",
            },
            {
              id: "3",
              name: "Maya Torres",
              avatarUrl: "https://i.pravatar.cc/150?u=mayatorres",
            },
            {
              id: "4",
              name: "James Okafor",
              avatarUrl: "https://i.pravatar.cc/150?u=jamesokafor",
            },
          ],
        }}
        cta={{
          text: "Save 10+ hours on every project with 9.3s AI SketchUp rendering",
          buttonText: "Start 14-Day Free Trial",
          onButtonClick: () => router.push("/render"),
        }}
      />
    </div>
  );
}
