"use client";
import React from "react";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

const testimonials = [
  {
    text: "By far the best tool in terms of speed and accuracy-to-geometry. It preserves my SketchUp walls, cabinetry, and openings with zero drift, while delivering V-Ray level realism in under 10 seconds.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    name: "Luke Vercia",
    role: "Architectural Visualization Artist",
  },
  {
    text: "We were about to invest $6,000 in a new GPU workstation just for rendering. V6 Render saved us that entire budget. It delivers breathtaking 4K outputs on a standard MacBook Air.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    name: "James Caldwell",
    role: "Principal Architect, London",
  },
  {
    text: "Clients can now see multiple material palettes and lighting moods live in the same meeting. No more overnight render queues or tedious Photoshop post-processing.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
    name: "Sofia Moreno",
    role: "Residential Designer, Barcelona",
  },
  {
    text: "I used to wait 30–45 minutes per test render in Lumion. Now I get physically believable lighting, reflections, and wood textures in 9.3 seconds right inside SketchUp.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
    name: "Tariq Al-Farsi",
    role: "Architectural Visualizer, Dubai",
  },
  {
    text: "The 100% design preservation is what sold us. Other AI tools redesign the room; V6 Render actually upgrades our real 3D geometry into photorealistic photographs.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
    name: "Hannah Kowalski",
    role: "Freelance Interior Designer, Warsaw",
  },
  {
    text: "Client approvals are 40% faster because they can visualize the real space instantly, and we've cut rendering outsourcing costs by over $2,000 every single month.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
    name: "Luca Ferretti",
    role: "Design Director, Milan",
  },
  {
    text: "Accurate material representation is everything in architecture. The tile reflections, PBR metals, and soft shadow falloffs look like an actual photo shoot.",
    image:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&q=80",
    name: "Aisha Okonkwo",
    role: "Architect & Educator, Lagos",
  },
  {
    text: "The 1-click video walkthroughs blow our clients away. Being able to deliver 3D animated walkthroughs same-day gives us an unfair advantage over other studios.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=80",
    name: "Ethan Brooks",
    role: "Commercial Interior Designer, NYC",
  },
  {
    text: "We switched from outsourcing renders at $150 per image to doing everything in-house with V6 Render. Instant turnaround, zero headaches.",
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
    <section className="relative my-20">
      <div className="z-10 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border px-4 py-1 text-sm font-medium">
              Testimonials
            </div>
          </div>
          <h2 className="mt-5 text-center text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            What designers & architects say
          </h2>
          <p className="text-muted-foreground mt-5 text-center lg:text-lg">
            Real feedback from interior designers and architects who replaced
            expensive GPU setups with our AI renderer.
          </p>
        </motion.div>

        <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] lg:max-h-[900px] lg:gap-8">
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
