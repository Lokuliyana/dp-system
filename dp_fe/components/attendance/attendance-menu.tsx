"use client";

import { LayoutDashboard, CalendarCheck, History, Settings } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { usePermission } from "@/hooks/usePermission";

export function AttendanceMenu() {
  const { can } = usePermission();

  const items = [
    {
      text: "Dashboard",
      href: "/attendance",
      icon: <LayoutDashboard className="h-4 w-4" />,
      permission: "student.attendance.read",
    },
    {
      text: "Mark Attendance",
      href: "/attendance/mark",
      icon: <CalendarCheck className="h-4 w-4" />,
      permission: "student.attendance.create",
    },
    {
      text: "History",
      href: "/attendance/history",
      icon: <History className="h-4 w-4" />,
      permission: "student.attendance.read",
    },
  ].filter(i => !i.permission || can(i.permission));

  if (items.length === 0) return null;

  return (
    <MainMenu>
      <MainMenuTitle>Attendance</MainMenuTitle>
      <MainMenuItem items={items} />
    </MainMenu>
  );
}
