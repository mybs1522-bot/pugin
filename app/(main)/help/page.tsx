"use client";

import {
  MessageCircle,
  Clock,
  Shield,
  Zap,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WA_NUMBER = "919198747810";
const WA_MESSAGE = encodeURIComponent("Hi! I need help with V6 Render.");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

const supportHighlights = [
  {
    icon: Clock,
    label: "Response in 1–2 hours",
    sub: "Average reply time 1–2 hours",
  },
  {
    icon: Shield,
    label: "Secure & confidential",
    sub: "Your data is never shared",
  },
  { icon: Zap, label: "Expert support", sub: "Handled by the product team" },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-4">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Help & Support
        </h1>
        <p className="text-muted-foreground text-sm">
          Find answers to common questions or reach our team directly on
          WhatsApp.
        </p>
      </div>

      {/* WhatsApp CTA card */}
      <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/20">
        <CardContent className="p-0">
          <div className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            {/* Icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-green-500/30">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 space-y-1">
              <p className="text-xs font-semibold tracking-widest text-green-700 uppercase dark:text-green-400">
                Live Support
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Chat with us on WhatsApp
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get instant help from our team. Available 7 days a week for
                billing, technical issues, and feature questions.
              </p>
            </div>

            {/* CTA */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full shrink-0 sm:w-auto"
            >
              <Button className="w-full gap-2 bg-[#25D366] px-6 text-white shadow-md shadow-green-500/20 hover:bg-[#20bd5a] sm:w-auto">
                <MessageCircle className="h-4 w-4" />
                Start Chat
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Highlights strip */}
          <div className="grid grid-cols-3 divide-x divide-green-200 border-t border-green-200 dark:divide-green-800 dark:border-green-800">
            {supportHighlights.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 px-4 py-3 text-center"
              >
                <Icon className="mb-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {label}
                </span>
                <span className="hidden text-[11px] text-zinc-500 sm:block dark:text-zinc-400">
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email fallback */}
      <div className="bg-background flex items-center gap-3 rounded-xl border px-5 py-4">
        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
          <Mail className="text-muted-foreground h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Prefer email?</p>
          <p className="text-muted-foreground truncate text-xs">
            Reach us at{" "}
            <span className="text-foreground font-medium">
              design@avada.space
            </span>
          </p>
        </div>
        <a href="mailto:design@avada.space" className="shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Send email
            <ChevronRight className="h-3 w-3" />
          </Button>
        </a>
      </div>

      {/* Still stuck */}
      <div className="bg-background flex flex-col items-center gap-3 rounded-xl border px-6 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium">Still have a question?</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Our team is ready to help you right away.
          </p>
        </div>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
          <Button className="gap-2 bg-[#25D366] px-6 text-white hover:bg-[#20bd5a]">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Open WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
