import Link from "next/link";
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

const features = [
  {
    icon: Wand2,
    title: "SketchUp Viewport Lock",
    description:
      "Renders directly from your active SketchUp viewport, preserving 100% of your geometry, walls, doors, and furniture.",
  },
  {
    icon: Camera,
    title: "Photorealistic Images & 3D Videos",
    description:
      "Generate high-resolution 4K interior & exterior images plus smooth cinematic 3D video walkthroughs.",
  },
  {
    icon: Zap,
    title: "No GPU & No High RAM Needed",
    description:
      "Zero expensive graphics card or high RAM required. Cloud TPUs handle all heavy rendering seamlessly on any computer.",
  },
  {
    icon: Layers,
    title: "100% Design Fidelity",
    description:
      "Locks room layout, staircases, glass block partitions, and cabinetry with zero AI hallucinations.",
  },
  {
    icon: Download,
    title: "One-Click RBZ Plugin Setup",
    description:
      "Download the official .rbz plugin archive and install directly inside SketchUp in under 10 seconds.",
  },
  {
    icon: Shield,
    title: "Fast & Ephemeral",
    description:
      "Renders finish in seconds with automatic gallery saving and high-resolution direct downloads.",
  },
];

const steps = [
  {
    number: "01",
    title: "Install SketchUp Plugin",
    body: "Download the official aisoft_render.rbz file and install it inside SketchUp in 10 seconds.",
    icon: ImageIcon,
  },
  {
    number: "02",
    title: "Capture Any Viewport",
    body: "Click Render Viewport directly inside SketchUp without needing expensive GPUs or high RAM setups.",
    icon: Layers,
  },
  {
    number: "03",
    title: "Images & 3D Videos",
    body: "Get crisp 4K interior/exterior photos and smooth 3D video walkthroughs delivered seamlessly.",
    icon: Zap,
  },
];

export default function HomePage() {
  return (
    <>
      <div className="min-h-svh w-full bg-gray-50 dark:bg-transparent">
        {/* ── Navbar ─────────────────────────────────────────── */}
        <nav className="dark:bg-background/80 sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-12 xl:px-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-background flex h-7 w-7 items-center justify-center rounded-lg border">
                <Palette className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">
                SketchUp AI Renderer
              </span>
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
                How it works
              </Link>
              <Link
                href="#download"
                className="hover:text-foreground transition-colors"
              >
                Download Plugin
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <GoogleAuth />
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/render">
                  <Sparkles className="h-3.5 w-3.5" />
                  Open Studio
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* ── Download the App (top) ───────────────────────── */}
        <CinematicFooter windowsHref="#" macHref="#" />

        <div className="mx-auto w-full max-w-7xl space-y-20 px-6 py-16 pb-24 lg:space-y-28 lg:px-12 lg:py-24 xl:px-16">
          {/* ── Funding announcement ───────────────────────── */}
          <FundingAnnouncement />

          {/* ── Before / After cards ─────────────────────────── */}
          <div className="flex justify-center py-4">
            <BeforeAfterCards />
          </div>

          {/* ── How it works ─────────────────────────────────── */}
          <section
            id="how-it-works"
            className="bg-background rounded-2xl border px-6 py-12 sm:px-12 lg:px-20 lg:py-20"
          >
            <div className="mb-10 text-center lg:mb-16">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                How it works
              </h2>
              <p className="text-muted-foreground mt-2 text-sm lg:mt-4 lg:text-base">
                Three steps from SketchUp viewport to photorealistic images & 3D
                videos.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3 lg:gap-14">
              {steps.map((s) => (
                <div
                  key={s.number}
                  className="flex flex-col items-center gap-4 text-center lg:gap-6"
                >
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border before:absolute before:-inset-2 before:rounded-full before:border lg:h-20 lg:w-20 dark:border-white/10 dark:before:border-white/5">
                    <s.icon
                      className="h-5 w-5 lg:h-8 lg:w-8"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                      {s.number}
                    </p>
                    <p className="mt-1 font-medium lg:mt-2 lg:text-xl">
                      {s.title}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-6 lg:mt-3 lg:text-base lg:leading-7">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Stats dashboard ───────────────────────────────── */}
          <StatsDashboard />

          {/* ── Trusted by ────────────────────────────────── */}
          <TrustedBySection />

          {/* ── Testimonials ──────────────────────────────── */}
          <TestimonialsSection />
        </div>
      </div>

      {/* ── Site footer ─────────────────────────────────────── */}
      <Footer
        brandName="SketchUp AI Renderer"
        brandDescription="Seamlessly render photorealistic interior & exterior images and 3D video walkthroughs directly inside SketchUp. No expensive graphics card or high RAM required."
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
          <Palette className="text-background h-8 w-8 drop-shadow-lg sm:h-10 sm:w-10 md:h-14 md:w-14" />
        }
      />
    </>
  );
}
