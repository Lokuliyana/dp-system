"use client";

import { Crown, ShieldCheck } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { usePermission } from "@/hooks/usePermission";

export function PrefectsMenu() {
  const { can } = usePermission();
  
  const items = [
    {
      text: "Prefects Directory",
      href: "/prefects",
      icon: <Crown className="h-4 w-4" />,
      permission: "staff.prefect.read",
    },
    {
      text: "Positions",
      href: "/prefects/positions",
      icon: <ShieldCheck className="h-4 w-4" />,
      permission: "staff.prefect_position.read",
    },
  ].filter(i => !i.permission || can(i.permission));

  if (items.length === 0) return null;

  return (
    <MainMenu>
      <MainMenuTitle>Prefects Management</MainMenuTitle>
      <MainMenuItem items={items} />
    </MainMenu>
  );
}
