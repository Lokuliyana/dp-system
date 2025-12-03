"use client";

import { ClubsAndSocieties } from "@/components/clubs";
import { Award } from "lucide-react";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { ActivitiesMenu } from "@/components/activities/activities-menu";

export default function ClubsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ActivitiesMenu />

      <DynamicPageHeader
        title="Clubs & Societies"
        subtitle="Configure clubs, manage memberships, and control student leadership roles."
        icon={Award}
      />

      <div className="p-6">
        <ClubsAndSocieties />
      </div>
    </LayoutController>
  );
}
