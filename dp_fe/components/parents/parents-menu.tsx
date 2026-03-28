"use client";

import { Users2 } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { usePermission } from "@/hooks/usePermission";

export function ParentsMenu() {
  const { can } = usePermission();

  const items = [
    {
      text: "Parents Directory",
      href: "/parents",
      icon: <Users2 className="h-4 w-4" />,
      permission: "student.parent.read",
    },
  ].filter(i => !i.permission || can(i.permission));

  if (items.length === 0) return null;

  return (
    <MainMenu>
      <MainMenuTitle>Parents Management</MainMenuTitle>
      <MainMenuItem items={items} />
    </MainMenu>
  );
}
