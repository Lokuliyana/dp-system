"use client";

import { LayoutDashboard, FileEdit, GraduationCap } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function ExamsMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Exams & Results</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Exams Dashboard",
            href: "/exams",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            text: "Marking Results",
            href: "/exams/mark",
            icon: <FileEdit className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
