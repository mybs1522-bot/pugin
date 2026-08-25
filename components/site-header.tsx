"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleAuth } from "@/components/google-auth";

const PAGE_TITLES: Record<string, string> = {
  "/render": "AI Studio",
  "/gallery": "Gallery",
  "/settings": "Settings",
  "/help": "Help & Docs",
};

export default function SiteHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "V6 Render";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div className="bg-border h-4 w-px" />
        <div className="flex flex-1 items-center">
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <ThemeToggle />
        <GoogleAuth />
      </div>
    </header>
  );
}
