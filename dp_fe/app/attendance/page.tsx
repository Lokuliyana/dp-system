"use client";

import { CalendarCheck } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
import { EnrichedAttendanceDashboard } from "@/components/attendance/enriched-attendance-dashboard";

export default function AttendancePage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <AttendanceMenu />

      <div className="p-8 max-w-7xl mx-auto">
        <EnrichedAttendanceDashboard />
      </div>
    </LayoutController>
  );
}
