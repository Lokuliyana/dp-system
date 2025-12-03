"use client";

import { Crown, ShieldCheck } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function PrefectsMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Prefects Management</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Prefects Directory",
            href: "/prefects",
            icon: <Crown className="h-4 w-4" />,
          },
          {
            text: "Positions",
            href: "/prefects/positions",
            icon: <ShieldCheck className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
