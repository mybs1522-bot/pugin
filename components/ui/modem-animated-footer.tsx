"use client";
import React from "react";
import Link from "next/link";
import { NotepadTextDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
}

export const Footer = ({
  brandName = "YourBrand",
  brandDescription = "Your description here",
  socialLinks = [],
  navLinks = [],
  creatorName,
  creatorUrl,
  brandIcon,
  className,
}: FooterProps) => {
  return (
    <section className={cn("relative mt-0 w-full overflow-hidden", className)}>
      <footer className="bg-background relative mt-10 border-t sm:mt-20">
        <div className="relative mx-auto flex min-h-[22rem] max-w-7xl flex-col justify-between p-4 py-8 sm:min-h-[35rem] sm:py-10 md:min-h-[40rem]">
          <div className="mb-8 flex w-full flex-col sm:mb-20 md:mb-0">
            <div className="flex w-full flex-col items-center">
              <div className="flex flex-1 flex-col items-center space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-2xl font-bold sm:text-3xl">
                    {brandName}
                  </span>
                </div>
                <p className="text-muted-foreground w-full max-w-sm px-2 text-center text-xs font-medium sm:w-96 sm:px-0 sm:text-sm sm:font-semibold">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-3 mb-6 flex gap-4 sm:mb-8">
                  {socialLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="h-5 w-5 duration-300 hover:scale-110 sm:h-6 sm:w-6">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="text-muted-foreground flex max-w-full flex-wrap justify-center gap-3 px-2 text-xs font-medium sm:gap-4 sm:px-4 sm:text-sm">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      className="hover:text-foreground duration-300 hover:font-semibold"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-2 px-2 sm:mt-20 sm:px-4 md:mt-24 md:flex-row md:items-center md:justify-between md:gap-1 md:px-0">
            <p className="text-muted-foreground text-center text-xs sm:text-base md:text-left">
              &copy;{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <Link
                  href={creatorUrl}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground text-base transition-colors duration-300 hover:font-medium"
                >
                  Crafted by {creatorName}
                </Link>
              </nav>
            )}
          </div>
        </div>

        {/* Large background text */}
        <div
          className="from-foreground/20 via-foreground/10 pointer-events-none absolute bottom-40 left-1/2 -translate-x-1/2 bg-gradient-to-b to-transparent bg-clip-text px-4 text-center leading-none font-extrabold tracking-tighter text-transparent select-none md:bottom-32"
          style={{
            fontSize: "clamp(3rem, 12vw, 10rem)",
            maxWidth: "95vw",
          }}
        >
          {brandName.toUpperCase()}
        </div>

        {/* Bottom logo */}
        <div className="hover:border-foreground bg-background/90 border-border absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-3xl border-2 p-3.5 drop-shadow-[0_0px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm duration-400 md:bottom-20 dark:drop-shadow-[0_0px_20px_rgba(255,255,255,0.3)]">
          <div className="flex h-12 w-auto items-center justify-center sm:h-16 md:h-20">
            {brandIcon || (
              <NotepadTextDashed className="text-background h-8 w-8 drop-shadow-lg sm:h-10 sm:w-10 md:h-14 md:w-14" />
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="via-border absolute bottom-32 left-1/2 h-1 w-full -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent backdrop-blur-sm sm:bottom-34" />

        {/* Bottom shadow */}
        <div className="from-background via-background/80 to-background/40 absolute bottom-28 h-24 w-full bg-gradient-to-t blur-[1em]" />
      </footer>
    </section>
  );
};
