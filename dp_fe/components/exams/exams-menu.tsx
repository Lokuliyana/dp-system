"use client";

import { LayoutDashboard, FileEdit, GraduationCap } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { usePermission } from "@/hooks/usePermission";

export function ExamsMenu() {
  const { can } = usePermission();
  return (
    <MainMenu>
      <MainMenuTitle>Exams & Results</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Exams Dashboard",
            href: "/exams",
            icon: <LayoutDashboard className="h-4 w-4" />,
            permission: "student.exam_result.read"
          },
          {
            text: "Marking Results",
            href: "/exams/mark",
            icon: <FileEdit className="h-4 w-4" />,
            permission: "student.exam_result.update"
          },
        ].filter(item => !item.permission || can(item.permission as any))}
      />
    </MainMenu>
  );
}
