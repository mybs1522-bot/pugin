"use client";

import dynamic from "next/dynamic";

export interface DownloadPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: "windows" | "mac";
  windowsHref?: string;
  macHref?: string;
  defaultEmail?: string;
  hideEmail?: boolean;
  mode?: "download" | "activate_pro";
  onProActivated?: (email: string) => void;
}

const DynamicModal = dynamic(
  () =>
    import("./download-pricing-modal-inner").then(
      (mod) => mod.DownloadPricingModal
    ),
  { ssr: false }
);

export function DownloadPricingModal(props: DownloadPricingModalProps) {
  if (!props.open) return null;
  return <DynamicModal {...props} />;
}

export const DownloadCheckoutCard = dynamic(
  () =>
    import("./download-pricing-modal-inner").then(
      (mod) => mod.DownloadCheckoutCard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full max-w-[480px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-zinc-400">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
      </div>
    ),
  }
);
