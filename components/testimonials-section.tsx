"use client";
import React from "react";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

const testimonials = [
  {
    text: "Preserves our exact SketchUp walls, cabinetry, and camera perspective with zero drift. V-Ray level quality directly from the viewport.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    name: "Luke Vercia",
    role: "Architectural Visualization Artist",
  },
  {
    text: "Saved us $6,000 on new GPU workstations. Renders flawless 4K presentation packages in the cloud from standard MacBooks.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    name: "James Caldwell",
    role: "Principal Architect, London",
  },
  {
    text: "We closed a $180k remodel in one meeting by testing finishes and lighting moods live in front of the client.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
    name: "Sofia Moreno",
    role: "Residential Designer, Barcelona",
  },
  {
    text: "No more multi-hour machine freezes. High-res stills and 3D walkthroughs are ready inside SketchUp in seconds.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
    name: "Tariq Al-Farsi",
    role: "Architectural Visualizer, Dubai",
  },
  {
    text: "Unlike generic tools that warp walls and ruin scale, V6 Render locks our CAD dimensions mathematically.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
    name: "Hannah Kowalski",
    role: "Freelance Interior Designer, Warsaw",
  },
  {
    text: "Client sign-offs dropped from 3 weeks to 4 days. Saved over $2,500/mo in outsourced rendering bills.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
    name: "Luca Ferretti",
    role: "Design Director, Milan",
  },
  {
    text: "PBR glass reflections, metal finishes, and natural daylight bounce look like a finished architectural photo shoot.",
    image:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&q=80",
    name: "Aisha Okonkwo",
    role: "Architect & Educator, Lagos",
  },
  {
    text: "Delivering 3D video walkthroughs on the same day gives our studio an unfair advantage on pitches.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=80",
    name: "Ethan Brooks",
    role: "Commercial Interior Designer, NYC",
  },
  {
    text: "Replaced $150/image outsourced rendering with instant in-house 4K delivery directly inside SketchUp.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80",
    name: "Mei-Lin Chen",
    role: "Studio Owner, Singapore",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section className="relative my-4 sm:my-20">
      <div className="z-10 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm">
              Testimonials
            </div>
          </div>
          <h2 className="mt-3 text-center text-xl font-bold tracking-tight sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            What designers & architects say
          </h2>
          <p className="text-muted-foreground mt-2 text-center text-sm leading-relaxed sm:mt-4 sm:text-base lg:text-lg">
            Real feedback from interior designers and architects who replaced
            heavy, complex render pipelines with V6 Render.
          </p>
        </motion.div>

        <div className="mt-6 flex max-h-[520px] justify-center gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] sm:mt-10 sm:max-h-[740px] sm:gap-6 lg:max-h-[900px] lg:gap-8">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
