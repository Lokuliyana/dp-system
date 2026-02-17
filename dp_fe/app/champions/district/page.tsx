"use client";

import { ChampionsPathView } from "@/components/champions/champions-path-view";
import { LayoutController } from "@/components/layout/dynamic";
import { ChampionsMenu } from "@/components/champions/champions-menu";
import { Medal } from "lucide-react";

export default function DistrictPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar showSidebar>
      <ChampionsMenu />
      <ChampionsPathView 
        level="district"
        title="District Team Dashboard"
        description="Overview of students qualified for District level and school results."
        icon={Medal}
      />
    </LayoutController>
  );
}

