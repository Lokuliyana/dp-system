"use client";

import { Trophy } from "lucide-react";
import { EventsManagement } from "@/components/events/events-management";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { ActivitiesMenu } from "@/components/activities/activities-menu";

export default function EventsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ActivitiesMenu />

      <DynamicPageHeader
        title="Events & Activities"
        subtitle="Plan events, register students, and manage ND / CN highlight stars."
        icon={Trophy}
      />

      <div className="p-6">
        <EventsManagement />
      </div>
    </LayoutController>
  );
}
