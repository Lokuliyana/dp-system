"use client";

import { CalendarCheck } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Present</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Today's attendance</p>
            </CardContent>
          </Card>
          {/* Add more stats cards here */}
        </div>
        
        <div className="mt-6">
          <p className="text-muted-foreground">Select "Mark Attendance" from the menu to record attendance for a class.</p>
        </div>
      </div>
    </LayoutController>
  );
}
