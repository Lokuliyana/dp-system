"use client";

import { Users, ShieldCheck, Home } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function StaffMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Staff Management</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Staff Directory",
            href: "/staff",
            icon: <Users className="h-4 w-4" />,
          },
          {
            text: "Roles & Permissions",
            href: "/staff/roles",
            icon: <ShieldCheck className="h-4 w-4" />,
          },
          {
            text: "Teacher House Assignments",
            href: "/staff/house-assignments",
            icon: <Home className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
