"use client";

import { LayoutDashboard, CalendarCheck, History, Settings } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function AttendanceMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Attendance</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Dashboard",
            href: "/attendance",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            text: "Mark Attendance",
            href: "/attendance/mark",
            icon: <CalendarCheck className="h-4 w-4" />,
          },
          {
            text: "History",
            href: "/attendance/history",
            icon: <History className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
