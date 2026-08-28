import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Wand2,
  Sparkles,
  Palette,
  Zap,
  Shield,
  ArrowRight,
  ImageIcon,
  Layers,
  Camera,
  Download,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleAuth } from "@/components/google-auth";

const CinematicFooter = dynamic(
  () => import("@/components/ui/motion-footer").then((m) => m.CinematicFooter),
  { loading: () => null }
);
const StatsDashboard = dynamic(
  () => import("@/components/stats-dashboard").then((m) => m.StatsDashboard),
  { loading: () => null }
);
const TrustedBySection = dynamic(
  () =>
    import("@/components/trusted-by-section").then((m) => m.TrustedBySection),
  { loading: () => null }
);
const BeforeAfterCards = dynamic(
  () => import("@/components/ui/3d-card").then((m) => m.BeforeAfterCards),
  { loading: () => null }
);
const TestimonialsSection = dynamic(
  () =>
    import("@/components/testimonials-section").then(
      (m) => m.TestimonialsSection
    ),
  { loading: () => null }
);
const Footer = dynamic(
  () => import("@/components/ui/modem-animated-footer").then((m) => m.Footer),
  { loading: () => null }
);
const FundingAnnouncement = dynamic(
  () =>
    import("@/components/ui/funding-announcement").then(
      (m) => m.FundingAnnouncement
    ),
  { loading: () => null }
);
const FlippingMeter = dynamic(
  () => import("@/components/ui/flipping-meter").then((m) => m.FlippingMeter),
  { loading: () => null }
);

const features = [
  {
    icon: Wand2,
    title: "100% Exact Geometry Lock",
    description:
      "Zero warped walls or broken scale. Your cabinetry, door reveals, and room dimensions remain mathematically locked.",
  },
  {
    icon: Camera,
    title: "4K Stills & 3D Walkthroughs",
    description:
      "Deliver publication-ready 4K perspectives and cinematic video walkthroughs in minutes, not days.",
  },
  {
    icon: Zap,
    title: "Zero GPU Upgrades Required",
    description:
      "Cloud-accelerated rendering. Get $5,000 RTX workstation power on any MacBook or standard laptop.",
  },
  {
    icon: Layers,
    title: "Live Client Mood Iterations",
    description:
      "Switch finishes, daylight angles, and material palettes live during client meetings for immediate sign-offs.",
  },
  {
    icon: Download,
    title: "Native One-Click Plugin",
    description:
      "Runs natively inside SketchUp as a standard .rbz file. No file exporting, broken FBX textures, or proxy linking.",
  },
  {
    icon: Shield,
    title: "True Physical PBR Lighting",
    description:
      "Accurate daylight bounce, glass refractions, and realistic material textures that look like an actual photo shoot.",
  },
];

const steps = [
  {
    number: "01",
    title: "Install Native .rbz Plugin",
    body: "One-click installation inside SketchUp Extension Manager for Windows & macOS.",
    icon: ImageIcon,
  },
  {
    number: "02",
    title: "Frame Any Viewport Angle",
    body: "Locks your exact CAD geometry, structural dimensions, and camera perspective.",
    icon: Layers,
  },
  {
    number: "03",
    title: "Generate 4K Stills & Walkthroughs",
    body: "Instant photorealistic lighting, physical PBR reflections, and smooth 3D video.",
    icon: Zap,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Top Live Flipping Meter (Sticky) ──────────────── */}
      <FlippingMeter />

      <div className="min-h-svh w-full bg-gray-50 dark:bg-transparent">
        {/* ── Navbar ─────────────────────────────────────────── */}
        <nav className="dark:bg-background/80 sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 sm:py-2 lg:px-12 xl:px-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/v6-logo.png"
                alt="V6 Logo"
                width={90}
                height={60}
                className="h-11 w-auto object-contain sm:h-13 md:h-14"
                priority
              />
            </Link>
            <div className="text-muted-foreground hidden items-center gap-6 text-sm sm:flex">
              <Link
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing & Trial
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* ── Download the App (top) ───────────────────────── */}
        <CinematicFooter windowsHref="#" macHref="#" />

        <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-3 pb-8 sm:space-y-16 sm:px-6 sm:py-12 sm:pb-20 lg:space-y-24 lg:px-12 lg:py-20 xl:px-16">
          {/* ── How it works (Complete Workflow in 3 Simple Steps) ─ */}
          <section
            id="how-it-works"
            className="bg-background rounded-xl border px-3 py-5 sm:rounded-2xl sm:px-12 sm:py-12 lg:px-20 lg:py-20"
          >
            <div className="mb-4 text-center sm:mb-10 lg:mb-16">
              <h2 className="text-xl font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                From SketchUp to 4K Presentation in 3 Steps
              </h2>
              <p className="text-muted-foreground mt-1.5 text-xs sm:mt-2 sm:text-base lg:mt-3 lg:text-lg">
                No render queues, complex node graphs, or export bottlenecks.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-8 lg:gap-14">
              {steps.map((s) => (
                <div
                  key={s.number}
                  className="flex flex-col items-center gap-3 text-center sm:gap-4 lg:gap-6"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border before:absolute before:-inset-1.5 before:rounded-full before:border sm:h-12 sm:w-12 lg:h-20 lg:w-20 dark:border-white/10 dark:before:border-white/5">
                    <s.icon
                      className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase sm:text-xs">
                      {s.number}
                    </p>
                    <p className="mt-1 text-base font-bold sm:text-lg lg:mt-2 lg:text-xl">
                      {s.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:mt-1.5 sm:text-sm sm:leading-6 lg:mt-2 lg:text-base">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Stats dashboard ───────────────────────────────── */}
          <StatsDashboard />

          {/* ── Before / After cards ─────────────────────────── */}
          <div className="flex justify-center py-1 sm:py-3">
            <BeforeAfterCards />
          </div>

          {/* ── Features Grid Section ────────────────────────── */}
          <section id="features" className="space-y-3.5 sm:space-y-8">
            <div className="text-center">
              <div className="border-primary/30 bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wider uppercase sm:mb-3 sm:px-4 sm:text-xs">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Built for
                Architects & Designers
              </div>
              <h2 className="text-xl font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                Why Leading Studios Replaced Heavy Render Farms
              </h2>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-2xl text-xs leading-relaxed sm:mt-3 sm:text-base lg:text-lg">
                Stop losing hours to trial-and-error lighting passes and frozen
                laptops.
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {features.map((f, i) => (
                <Card
                  key={i}
                  className="border-border/60 bg-card/60 hover:border-foreground/30 relative overflow-hidden rounded-lg backdrop-blur-sm transition-all hover:shadow-lg sm:rounded-2xl"
                >
                  <CardContent className="flex flex-col gap-2 p-3.5 sm:gap-3.5 sm:p-6">
                    <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border sm:h-11 sm:w-11 sm:rounded-xl">
                      <f.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg lg:text-xl">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm lg:text-[15px]">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── Funding announcement (Pricing Offer) ───────────── */}
          <div id="pricing">
            <FundingAnnouncement />
          </div>

          {/* ── Trusted by ────────────────────────────────── */}
          <TrustedBySection />

          {/* ── Testimonials ──────────────────────────────── */}
          <TestimonialsSection />
        </div>
      </div>

      {/* ── Site footer ─────────────────────────────────────── */}
      <Footer
        brandName="V6 Render"
        brandDescription="Architectural rendering extension for SketchUp. Deliver client-winning 4K presentation visuals and smooth 3D walkthroughs with 100% exact CAD geometry preservation and zero GPU hardware load."
        socialLinks={[
          {
            icon: <Twitter className="h-6 w-6" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Linkedin className="h-6 w-6" />,
            href: "https://linkedin.com",
            label: "LinkedIn",
          },
          {
            icon: <Github className="h-6 w-6" />,
            href: "https://github.com",
            label: "GitHub",
          },
          {
            icon: <Mail className="h-6 w-6" />,
            href: "mailto:hello@interiordesigner.ai",
            label: "Email",
          },
        ]}
        navLinks={[
          { label: "Render Studio", href: "/render" },
          { label: "Help & Support", href: "/help" },
          { label: "Settings", href: "/settings" },
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Service", href: "#" },
        ]}
        brandIcon={
          <Image
            src="/v6-logo.png"
            alt="V6 Render Logo"
            width={80}
            height={53}
            className="h-10 w-auto object-contain sm:h-12 md:h-14"
          />
        }
      />
    </>
  );
}
