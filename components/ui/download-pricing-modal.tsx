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
