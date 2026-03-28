"use client";

import { LayoutDashboard, Users, GraduationCap, UserPlus, Layers } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useGrades } from "@/hooks/useGrades";

export function StudentsMenu() {
  const { data: grades = [] } = useGrades();

  return (
    <MainMenu>
      <MainMenuTitle>Students</MainMenuTitle>
      <PermissionGuard permission="student.student.read">
        <MainMenuItem
          items={[
            {
              text: "All Students",
              href: "/students/all",
              icon: <Users className="h-4 w-4" />,
            },
            {
              text: "By Grade",
              href: "/students",
              icon: <Layers className="h-4 w-4" />,
            },
          ]}
        />
      </PermissionGuard>

      <PermissionGuard permission="system.grade.read">
        <MainMenuTitle>Academics</MainMenuTitle>
        <MainMenuItem
          items={[
            {
              text: "All Grades",
              href: "#", // Collapsible parent
              icon: <GraduationCap className="h-4 w-4" />,
              subMenus: grades.map((grade) => ({
                text: grade.nameSi,
                href: `/students/${grade.id}`,
                icon: <GraduationCap className="h-4 w-4" />,
              })),
            },
          ]}
        />
      </PermissionGuard>

    </MainMenu>
  );
}
