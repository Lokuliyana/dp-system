"use client";

import { Users, ShieldCheck, Home } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { PermissionGuard } from "@/components/auth/permission-guard";

import { usePermission } from "@/hooks/usePermission";

export function StaffMenu() {
  const { can } = usePermission();
  return (
    <MainMenu>
      <MainMenuTitle>Staff Management</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Staff Directory",
            href: "/staff",
            icon: <Users className="h-4 w-4" />,
            permission: "staff.teacher.read"
          },
          {
            text: "Roles & Permissions",
            href: "/staff/roles",
            icon: <ShieldCheck className="h-4 w-4" />,
            permission: "staff.staff_role.read"
          },
        ].filter(item => !item.permission || (can(item.permission as any)))}
      />
    </MainMenu>
  );
}
