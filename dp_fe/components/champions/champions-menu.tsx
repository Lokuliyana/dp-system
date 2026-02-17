"use client";

import { Map, Medal, Globe, LayoutDashboard } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function ChampionsMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Champions Dashboard</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Overview",
            href: "/champions",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            text: "Zonal Level",
            href: "/champions/zonal",
            icon: <Map className="h-4 w-4" />,
          },
          {
            text: "District Level",
            href: "/champions/district",
            icon: <Medal className="h-4 w-4" />,
          },
          {
            text: "All Island Level",
            href: "/champions/all-island",
            icon: <Globe className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
