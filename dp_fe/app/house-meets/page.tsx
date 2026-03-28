"use client";

import { LayoutController } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { EnrichedHouseMeetsDashboard } from "@/components/house-meets/enriched-house-meets-dashboard";

export default function HouseMeetsPage() {
  const year = new Date().getFullYear();

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Competition Hub</h1>
          <p className="text-slate-500 font-medium">Real-time standings, grade dominance, and MVP spotlights.</p>
        </div>
        
        <EnrichedHouseMeetsDashboard year={year} />
      </div>
    </LayoutController>
  );
}
