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
    title: "100% Accurate AI Rendering",
    description:
      "Unlike generic AI tools that hallucinate and alter your design, V6 Render preserves your SketchUp model's geometry, textures, and camera perspective with zero drift.",
  },
  {
    icon: Camera,
    title: "4K Photorealism & 3D Video Walkthroughs",
    description:
      "Generate ultra-sharp 4K interior and exterior architectural photographs, plus smooth cinematic 3D walkthrough videos in seconds.",
  },
  {
    icon: Zap,
    title: "No GPU, No High RAM, No Learning Curve",
    description:
      "Say goodbye to $5,000 GPU workstations and complex V-Ray or Lumion render settings. High-speed cloud AI handles all heavy processing on any laptop or desktop.",
  },
  {
    icon: Layers,
    title: "Effortless Client Feedback Loops",
    description:
      "Explore dozens of material finishes, styles, and lighting moods live in client meetings. Cut revision turnaround from days down to seconds.",
  },
  {
    icon: Download,
    title: "10-Second Native .rbz Plugin Setup",
    description:
      "Download the lightweight v6_render.rbz file and launch directly inside SketchUp with zero complex installations or configuration required.",
  },
  {
    icon: Shield,
    title: "Lightning-Fast 9.3s Renders",
    description:
      "Renders finish in under 10 seconds with automatic high-resolution gallery saving and instant one-click direct downloads.",
  },
];

const steps = [
  {
    number: "01",
    title: "Install the SketchUp Plugin",
    body: "Download the official v6_render.rbz file and install it inside SketchUp Extension Manager in under 10 seconds.",
    icon: ImageIcon,
  },
  {
    number: "02",
    title: "Capture Any Viewport Angle",
    body: "Click Render inside SketchUp to capture your active view with 100% geometry and camera fidelity.",
    icon: Layers,
  },
  {
    number: "03",
    title: "Generate 4K Stills & 3D Videos",
    body: "Receive photorealistic 4K architectural visuals and smooth 3D video walkthroughs delivered in under 10 seconds.",
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
              <span className="text-sm font-bold tracking-tight">
                V6 Render
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
          {/* ── Funding announcement (Pricing Offer) ───────────── */}
          <div id="pricing">
            <FundingAnnouncement />
          </div>

          {/* ── Before / After cards ─────────────────────────── */}
          <div className="flex justify-center py-4">
            <BeforeAfterCards />
          </div>

          {/* ── Features Grid Section ────────────────────────── */}
          <section id="features" className="space-y-10">
            <div className="text-center">
              <div className="border-primary/30 bg-primary/10 text-primary mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-widest uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Built for Architects &
                Designers
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                The Smarter Way to Render in SketchUp
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-relaxed lg:text-base">
                Eliminate hours of manual lighting setups, complex render
                settings, and long wait times. Get instant, physically accurate
                PBR photorealism directly from your SketchUp viewport.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Card
                  key={i}
                  className="border-border/60 bg-card/60 hover:border-foreground/30 relative overflow-hidden backdrop-blur-sm transition-all hover:shadow-lg"
                >
                  <CardContent className="flex flex-col gap-3.5 p-6">
                    <div className="bg-primary/10 text-primary border-primary/20 flex h-11 w-11 items-center justify-center rounded-xl border">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-foreground text-lg font-bold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── How it works ─────────────────────────────────── */}
          <section
            id="how-it-works"
            className="bg-background rounded-2xl border px-6 py-12 sm:px-12 lg:px-20 lg:py-20"
          >
            <div className="mb-10 text-center lg:mb-16">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                Complete Workflow in 3 Simple Steps
              </h2>
              <p className="text-muted-foreground mt-2 text-sm lg:mt-4 lg:text-base">
                From raw SketchUp viewport to photorealistic 4K presentations in
                under 10 seconds.
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
                    <p className="mt-1 font-bold lg:mt-2 lg:text-xl">
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
        brandName="V6 Render"
        brandDescription="Lightning-fast SketchUp rendering software for architects and interior designers. Generate photorealistic 4K images and 3D video walkthroughs in under 10 seconds with zero GPU requirements."
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
