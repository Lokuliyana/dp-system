"use client";

import { CalendarCheck } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
import { AttendanceDashboard } from "@/components/attendance/attendance-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function AttendancePage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <AttendanceMenu />

      <DynamicPageHeader
        title="Attendance Dashboard"
        subtitle="Overview of student attendance."
        icon={CalendarCheck}
      />

      <div className="p-6">
        <AttendanceDashboard />
        
        <div className="mt-6">
          <p className="text-muted-foreground text-sm">
            Select &quot;Mark Attendance&quot; from the menu to record attendance for a class.
          </p>
        </div>
      </div>
    </LayoutController>
  );
}
