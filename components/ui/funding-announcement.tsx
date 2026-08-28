"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap, TrendingUp, Clock } from "lucide-react";
import { DownloadPricingModal } from "@/components/ui/download-pricing-modal";

const renderData = [
  { month: "Nov", renders: 1200 },
  { month: "Dec", renders: 3800 },
  { month: "Jan", renders: 8400 },
  { month: "Feb", renders: 16200 },
  { month: "Mar", renders: 31000 },
  { month: "Apr", renders: 58000 },
];

const DEADLINE = new Date("2026-04-27T23:59:59Z").getTime();

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target - Date.now())
  );
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const totalSecs = Math.floor(remaining / 1000);
  const d = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return { d, h, m, s };
}

function Pad({ n }: { n: number }) {
  return <span>{String(n).padStart(2, "0")}</span>;
}

export function FundingAnnouncement() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const { d, h, m, s } = useCountdown(DEADLINE);

  return (
    <>
      <DownloadPricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      <section className="w-full py-2 sm:py-8">
        <div className="grid items-center gap-4 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: Announcement ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col gap-3 sm:gap-6"
          >
            {/* Badge */}
            <div className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit max-w-full items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight whitespace-nowrap sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm sm:tracking-normal">
              <Zap className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
              <span>
                14-Day Risk-Free Trial · 50% Launch Discount · Lock It In
                Forever
              </span>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <h2 className="text-2xl leading-tight font-black tracking-tight sm:text-4xl lg:text-5xl">
                Studio-Grade Renders. <br />
                <span className="text-primary">Fraction of the Cost.</span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base lg:text-lg">
                No $4,000 GPU workstations. No complex V-Ray setups. For the
                next{" "}
                <span className="text-foreground font-semibold">15 days</span>,
                lock in unlimited cloud rendering for{" "}
                <span className="text-primary font-semibold">$15/mo</span>{" "}
                forever. Includes full 14-day free trial ($0 due today).
              </p>
            </div>

            {/* Price display */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  Monthly
                </span>
                <div className="flex items-end gap-1.5 sm:gap-2">
                  <span className="text-muted-foreground text-xs line-through sm:text-sm">
                    $40
                  </span>
                  <span className="text-primary text-3xl leading-none font-black sm:text-4xl">
                    $20
                  </span>
                </div>
                <span className="text-muted-foreground mt-0.5 text-xs sm:mt-1 sm:text-sm">
                  per month · forever
                </span>
              </div>
              <div className="border-border hidden h-12 w-px border-r sm:block" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase sm:text-xs">
                    Yearly
                  </span>
                  <span className="bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase sm:text-[10px]">
                    25% Extra Off
                  </span>
                </div>
                <div className="flex items-end gap-1.5 sm:gap-2">
                  <span className="text-muted-foreground text-xs line-through sm:text-sm">
                    $30
                  </span>
                  <span className="text-primary text-3xl leading-none font-black sm:text-4xl">
                    $15
                  </span>
                </div>
                <span className="text-muted-foreground mt-0.5 text-xs sm:mt-1 sm:text-sm">
                  per month · billed yearly
                </span>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Launch discount expires in
              </div>
              <div className="flex gap-2 sm:gap-3">
                {[
                  { val: d, label: "Days" },
                  { val: h, label: "Hrs" },
                  { val: m, label: "Min" },
                  { val: s, label: "Sec" },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    className="border-border bg-muted/40 flex h-14 w-14 flex-col items-center justify-center rounded-lg border sm:h-16 sm:w-16 sm:rounded-xl lg:h-20 lg:w-20"
                  >
                    <span className="text-base font-black tabular-nums sm:text-xl lg:text-2xl">
                      <Pad n={val} />
                    </span>
                    <span className="text-muted-foreground text-[9px] tracking-wider uppercase sm:text-[10px]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              onClick={() => setPricingOpen(true)}
              className="w-full cursor-pointer text-sm font-bold sm:w-fit sm:px-8 sm:text-base"
            >
              Start 14-Day Free Trial — Lock Discount Forever ↗
            </Button>
            <p className="text-muted-foreground -mt-2 text-[11px] sm:-mt-3 sm:text-xs">
              $0.00 due today · Instant plugin download · Cancel anytime with 1
              click
            </p>
          </motion.div>

          {/* ── Right: Chart ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            viewport={{ once: true }}
            className="border-border bg-background/60 relative h-[280px] w-full overflow-hidden rounded-xl border backdrop-blur-sm sm:h-[380px] sm:rounded-2xl lg:h-[440px]"
          >
            {/* Chart */}
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={renderData}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="renderGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [
                      `${v.toLocaleString()} renders`,
                      "",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="renders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#renderGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Overlay center stat */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="flex items-end gap-1">
                <h3 className="text-4xl font-black tracking-tight drop-shadow-lg sm:text-6xl lg:text-7xl">
                  <CountUp end={58} duration={2.5} />K
                </h3>
              </div>
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs sm:mt-1 sm:text-sm">
                <TrendingUp className="text-primary h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Renders generated this month
              </p>
            </div>

            {/* Side stats card */}
            <div className="border-border bg-background/80 absolute top-3 right-3 flex min-w-[90px] flex-col gap-2 rounded-lg border p-2.5 shadow-lg backdrop-blur-md sm:top-4 sm:right-4 sm:min-w-[110px] sm:gap-4 sm:rounded-xl sm:p-4">
              {[
                { value: "90+", label: "Countries" },
                { value: "7.5M+", label: "Renders Done" },
                { value: "100%", label: "Geometry Lock" },
                { value: "4.9 ★", label: "User Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-sm leading-none font-bold sm:text-lg">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[10px] sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom label */}
            <div className="text-muted-foreground absolute bottom-3 left-3 text-[10px] sm:bottom-4 sm:left-4 sm:text-xs">
              Renders generated · Nov 2025 – Apr 2026
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
