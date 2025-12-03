"use client";

import { Flag } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { SquadCrudPanel } from "@/components/house-meets/squad-crud-panel";

export default function SquadsManagementPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="Squad Management"
        subtitle="Manage squads and sub-units."
        icon={Flag}
      />

      <div className="p-6">
        <SquadCrudPanel description="Sub-units within houses or grades." />
      </div>
    </LayoutController>
  );
}
