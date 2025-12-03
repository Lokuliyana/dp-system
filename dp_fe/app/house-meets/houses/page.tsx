"use client";

import { Building2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";
import { HouseCrudPanel } from "@/components/house-meets/house-crud-panel";

export default function HousesManagementPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="House Management"
        subtitle="Manage school houses for competitions."
        icon={Building2}
      />

      <div className="p-6">
        <HouseCrudPanel description="School houses for competitions." />
      </div>
    </LayoutController>
  );
}
