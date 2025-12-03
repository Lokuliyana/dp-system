"use client";

import { Users2 } from "lucide-react";
import { ParentsManagement } from "@/components/parents";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { ParentsMenu } from "@/components/parents/parents-menu";

export default function ParentsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar={false}>
      <ParentsMenu />

      <DynamicPageHeader
        title="Parents & Guardians"
        subtitle="Manage parent records, contact details, occupations, and linked students."
        icon={Users2}
      />

      <div className="p-6">
        <ParentsManagement />
      </div>
    </LayoutController>
  );
}
