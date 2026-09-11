"use client";

import React from "react";

export const WindowsIcon = ({
  className = "h-3.5 w-3.5 shrink-0",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M0 3.449L9.75 2.1v9.451H0" fill="#f35325" />
    <path d="M10.949 2.098L24 0v11.551H10.949" fill="#81bc06" />
    <path d="M0 12.6h9.75v9.451L0 20.699" fill="#05a6f0" />
    <path d="M10.949 12.6H24V24l-12.9-1.801" fill="#ffba08" />
  </svg>
);

export const AppleIcon = ({
  className = "h-3.5 w-3.5 shrink-0 text-foreground",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 814 1000"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.8 135.7-317.9 269-317.9 70.5 0 129.5 46.4 173.1 46.4 41.8 0 108.2-49.9 188.4-49.9 30.8.1 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
  </svg>
);

export function PlatformBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide select-none sm:text-xs ${className}`}
    >
      <div className="flex items-center gap-1">
        <WindowsIcon className="h-3.5 w-3.5" />
        <span>Windows</span>
      </div>
      <span className="opacity-40">&</span>
      <div className="flex items-center gap-1">
        <AppleIcon className="text-foreground h-3.5 w-3.5" />
        <span>macOS</span>
      </div>
    </div>
  );
}
