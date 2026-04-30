"use client";

import { LayoutController } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { EnrichedHouseMeetsDashboard } from "@/components/house-meets/enriched-house-meets-dashboard";

export default function HouseMeetsPage() {
  const year = new Date().getFullYear();

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">House Meets</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of house standings, competition progress, and top performers.</p>
        </div>

        <EnrichedHouseMeetsDashboard year={year} />
      </div>
    </LayoutController>
  );
}
