"use client";

import { ChampionsPathView } from "@/components/champions/champions-path-view";
import { LayoutController } from "@/components/layout/dynamic";
import { ChampionsMenu } from "@/components/champions/champions-menu";
import { Globe } from "lucide-react";

export default function AllIslandPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar showSidebar>
      <ChampionsMenu />
      <ChampionsPathView 
        level="allisland"
        title="All Island Level"
        description="Manage national level competitions and final rankings."
        icon={Globe}
      />
    </LayoutController>
  );
}

