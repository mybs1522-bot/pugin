"use client";

import { useState } from "react";
import { MarketingDashboard } from "@/components/ui/dashboard-1";
import { DownloadPricingModal } from "@/components/ui/download-pricing-modal";
import { useSharedUserCount } from "@/lib/user-counter";

export function StatsDashboard() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const userCount = useSharedUserCount();

  return (
    <>
      <DownloadPricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
      <div className="flex justify-center">
        <MarketingDashboard
          title="Loved by 8,700+ SketchUp Designers in 90+ Countries"
          team={{
            memberCount: userCount,
            label: "Active Users",
            members: [
              {
                id: "1",
                name: "Aria Shah",
                avatarUrl: "https://i.pravatar.cc/150?u=ariashah",
              },
              {
                id: "2",
                name: "Leo Park",
                avatarUrl: "https://i.pravatar.cc/150?u=leopark",
              },
              {
                id: "3",
                name: "Maya Torres",
                avatarUrl: "https://i.pravatar.cc/150?u=mayatorres",
              },
              {
                id: "4",
                name: "James Okafor",
                avatarUrl: "https://i.pravatar.cc/150?u=jamesokafor",
              },
            ],
          }}
          cta={{
            text: "Win more client pitches and save 10+ hours per revision with instant 4K architectural rendering",
            buttonText: "Download Plugin Free",
            onButtonClick: () => setPricingOpen(true),
          }}
        />
      </div>
    </>
  );
}
