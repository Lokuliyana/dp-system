"use client";

import { LayoutDashboard, Users, GraduationCap, UserPlus, Layers } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { useGrades } from "@/hooks/useGrades";

export function StudentsMenu() {
  const { data: grades = [] } = useGrades();

  return (
    <MainMenu>
      <MainMenuTitle>Students</MainMenuTitle>
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

      <MainMenuTitle>Academics</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "All Grades",
            href: "#", // Collapsible parent
            icon: <GraduationCap className="h-4 w-4" />,
            subMenus: grades.map((grade) => ({
              text: grade.nameEn,
              href: `/students/${grade.id}`,
              icon: <GraduationCap className="h-4 w-4" />,
            })),
          },
        ]}
      />

    </MainMenu>
  );
}
