"use client";

import { useTheme } from "next-themes";
import { Sparkles } from "@/components/ui/sparkles";

export function DownloadSection() {
  const { resolvedTheme } = useTheme();
  const sparkleColor = resolvedTheme === "dark" ? "#ffffff" : "#8350e8";

  return (
    <section className="relative w-full overflow-hidden">
      {/* Download content — sits above the arc line */}
      <div className="relative z-20 px-6 pt-16 pb-10 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Download the App
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
          Native desktop experience&nbsp;·&nbsp;offline setup&nbsp;·&nbsp;cloud
          rendering engine
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Windows */}
          <a
            href="#"
            className="bg-background hover:bg-muted inline-flex items-center gap-4 rounded-2xl border px-6 py-3.5 text-left shadow-sm transition"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden>
              <path fill="#F25022" d="M0 0h11.5v11.5H0z" />
              <path fill="#7FBA00" d="M12.5 0H24v11.5H12.5z" />
              <path fill="#00A4EF" d="M0 12.5h11.5V24H0z" />
              <path fill="#FFB900" d="M12.5 12.5H24V24H12.5z" />
            </svg>
            <span>
              <span className="text-muted-foreground block text-[10px]">
                Download for
              </span>
              <span className="block text-sm font-semibold">Windows</span>
              <span className="text-muted-foreground block text-[10px]">
                All Versions
              </span>
            </span>
          </a>

          {/* macOS */}
          <a
            href="#"
            className="bg-background hover:bg-muted inline-flex items-center gap-4 rounded-2xl border px-6 py-3.5 text-left shadow-sm transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 shrink-0 fill-current"
              aria-hidden
            >
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
            <span>
              <span className="text-muted-foreground block text-[10px]">
                Download for
              </span>
              <span className="block text-sm font-semibold">macOS</span>
              <span className="text-muted-foreground block text-[10px]">
                All Versions
              </span>
            </span>
          </a>
        </div>

        {/* Footer links */}
        <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <a href="#" className="rounded px-2 py-1 hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="rounded px-2 py-1 hover:underline">
            Terms of Service
          </a>
          <a href="#" className="rounded px-2 py-1 hover:underline">
            Help &amp; Support
          </a>
        </div>
        <p className="text-muted-foreground/70 mt-3 text-[11px]">
          Free to download · Premium subscription required for rendering
        </p>
      </div>

      {/* Sparkles glow band with arc line */}
      <div className="relative h-72 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#8350e8,transparent_70%)] before:opacity-40" />
        <div className="absolute top-1/2 -left-1/2 z-10 aspect-[1/0.7] w-[200%] rounded-[100%] border-t border-zinc-900/20 bg-white dark:border-white/20 dark:bg-zinc-900" />
        <Sparkles
          density={1200}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
          color={sparkleColor}
        />
      </div>
    </section>
  );
}
