import type { Metadata } from "next";
import { Suspense } from "react";
import { DownloadClient } from "./download-client";

export const metadata: Metadata = {
  title: "Download V6 Render Plugin for SketchUp — Installation Guide",
  description:
    "Download the official v6_render.rbz extension for SketchUp and follow our quick 3-step setup guide for macOS and Windows.",
  openGraph: {
    title: "Download V6 Render Plugin for SketchUp",
    description:
      "Get the v6_render.rbz plugin and follow the 3-step guide to install into SketchUp.",
    url: "https://www.v6render.com/download",
  },
};

export default function DownloadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <DownloadClient />
    </Suspense>
  );
}
