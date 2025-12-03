"use client";

import { Building2 } from "lucide-react";
import { Header } from "@/components/ui";
import { HouseCrudPanel } from "@/components/house-meets/house-crud-panel";
import { SquadCrudPanel } from "@/components/house-meets/squad-crud-panel";

export default function StructureConfigurationPage() {
  return (
    <div className="space-y-6">
      <Header
        title="School Structure"
        description="Manage houses, squads, and physical organization."
        icon={Building2}
        variant="section"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <HouseCrudPanel description="School houses for competitions." />
        <SquadCrudPanel description="Sub-units within houses or grades." />
      </div>
    </div>
  );
}
