"use client";

import { TeamSelectionView } from "@/components/champions/team-selection-view";
import { LayoutController } from "@/components/layout/dynamic";
import { ChampionsMenu } from "@/components/champions/champions-menu";
import { Map } from "lucide-react";

export default function ZonalPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ChampionsMenu />
      <TeamSelectionView 
        level="zonal"
        title="Zonal Team Selection"
        description="Manage school team selection for Zonal competitions and record results."
        icon={Map}
      />
    </LayoutController>
  );
}

