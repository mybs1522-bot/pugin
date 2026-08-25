"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap, TrendingUp, Clock } from "lucide-react";

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
  const { d, h, m, s } = useCountdown(DEADLINE);

  return (
    <section className="w-full py-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Left: Announcement ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <div className="border-primary/30 bg-primary/10 text-primary inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold">
            <Zap className="h-4 w-4" />
            14-Day Free Trial · 50% Launch Discount · Zero GPU Needed
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl leading-tight font-black tracking-tight sm:text-4xl lg:text-5xl">
              Pro Architectural Rendering <br />
              <span className="text-primary">at a fraction of the cost.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed lg:text-lg">
              Stop paying thousands for expensive RTX workstations and complex
              V-Ray or Lumion licenses. For the next{" "}
              <span className="text-foreground font-semibold">
                15 days only
              </span>
              , lock in unlimited cloud rendering for{" "}
              <span className="text-primary font-semibold">$15/mo</span> (billed
              yearly) or{" "}
              <span className="text-primary font-semibold">$20/mo</span>{" "}
              monthly. Lock in now and this discounted rate is{" "}
              <span className="text-foreground font-semibold">
                yours forever
              </span>
              .
            </p>
          </div>

          {/* Price display */}
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Monthly
              </span>
              <div className="flex items-end gap-2">
                <span className="text-muted-foreground text-sm line-through">
                  $40
                </span>
                <span className="text-primary text-4xl leading-none font-black">
                  $20
                </span>
              </div>
              <span className="text-muted-foreground mt-1 text-sm">
                per month · forever
              </span>
            </div>
            <div className="bg-border w-px self-stretch" />
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Yearly
              </span>
              <div className="flex items-end gap-2">
                <span className="text-muted-foreground text-sm line-through">
                  $30
                </span>
                <span className="text-primary text-4xl leading-none font-black">
                  $15
                </span>
              </div>
              <span className="text-muted-foreground mt-1 text-sm">
                per month · billed yearly
              </span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Offer expires in
            </div>
            <div className="flex gap-3">
              {[
                { val: d, label: "Days" },
                { val: h, label: "Hrs" },
                { val: m, label: "Min" },
                { val: s, label: "Sec" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="border-border bg-muted/40 flex h-16 w-16 flex-col items-center justify-center rounded-xl border lg:h-20 lg:w-20"
                >
                  <span className="text-xl font-black tabular-nums lg:text-2xl">
                    <Pad n={val} />
                  </span>
                  <span className="text-muted-foreground text-[10px] tracking-widest uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button size="lg" className="w-fit px-8 text-base font-bold">
            Claim 50% Off — Lock it in Forever ↗
          </Button>
          <p className="text-muted-foreground -mt-3 text-xs">Cancel anytime</p>
        </motion.div>

        {/* ── Right: Chart ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          viewport={{ once: true }}
          className="border-border bg-background/60 relative h-[380px] w-full overflow-hidden rounded-2xl border backdrop-blur-sm lg:h-[440px]"
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
              <h3 className="text-6xl font-black tracking-tight drop-shadow-lg lg:text-7xl">
                <CountUp end={58} duration={2.5} />K
              </h3>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
              <TrendingUp className="text-primary h-3.5 w-3.5" />
              Renders generated this month
            </p>
          </div>

          {/* Side stats card */}
          <div className="border-border bg-background/80 absolute top-4 right-4 flex min-w-[110px] flex-col gap-4 rounded-xl border p-4 shadow-lg backdrop-blur-md">
            {[
              { value: "90+", label: "Countries" },
              { value: "7.5M+", label: "Renders Done" },
              { value: "9.3s", label: "Avg Speed" },
              { value: "4.9 ★", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg leading-none font-bold">{stat.value}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom label */}
          <div className="text-muted-foreground absolute bottom-4 left-4 text-xs">
            Renders generated · Nov 2025 – Apr 2026
          </div>
        </motion.div>
      </div>
    </section>
  );
}
