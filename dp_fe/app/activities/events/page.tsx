"use client";

import { Trophy } from "lucide-react";
import { EventsManagement } from "@/components/events/events-management";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { ActivitiesMenu } from "@/components/activities/activities-menu";
import { ExportButton } from "@/components/reusable";

export default function EventsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ActivitiesMenu />

      <DynamicPageHeader
        title="Events & Activities"
        subtitle="Plan events, register students, and manage ND / CN highlight stars."
        icon={Trophy}
        actions={
          <ExportButton 
            endpoint="/reports/teams" 
            filename="events_and_activities_report"
            size="sm"
          />
        }
      />

      <div className="p-6">
        <EventsManagement />
      </div>
    </LayoutController>
  );
}
