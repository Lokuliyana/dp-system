"use client";

import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { TeacherHouseAssignments } from "@/components/staff/teacher-house-assignments";
import { Home } from "lucide-react";

export default function TeacherHouseAssignmentsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StaffMenu />

      <DynamicPageHeader
        title="Teacher House Assignments"
        subtitle="Assign masters-in-charge to houses."
        icon={Home}
      />

      <div className="p-6">
        <TeacherHouseAssignments />
      </div>
    </LayoutController>
  );
}
