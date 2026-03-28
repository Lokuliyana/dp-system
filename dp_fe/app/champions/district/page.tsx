"use client";

import { ChampionsUnifiedView } from "@/components/champions/champions-unified-view";
import { LayoutController } from "@/components/layout/dynamic";
import { ChampionsMenu } from "@/components/champions/champions-menu";

export default function DistrictPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ChampionsMenu />
      <ChampionsUnifiedView level="district" />
    </LayoutController>
  );
}

