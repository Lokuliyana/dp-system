"use client";

import { LayoutDashboard, Users, Trophy, Medal, History, Building2, Flag } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function HouseMeetsMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>House Meets</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Dashboard",
            href: "/house-meets",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            text: "Assignments",
            href: "/house-meets/assignments",
            icon: <Users className="h-4 w-4" />,
          },
          {
            text: "Registrations",
            href: "/house-meets/registrations",
            icon: <Trophy className="h-4 w-4" />,
          },
          {
            text: "Results",
            href: "/house-meets/results",
            icon: <Medal className="h-4 w-4" />,
          },
          {
            text: "History",
            href: "/house-meets/history",
            icon: <History className="h-4 w-4" />,
          },
        ]}
      />

      <MainMenuTitle>Configuration</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Competitions",
            href: "/house-meets/competitions",
            icon: <Trophy className="h-4 w-4" />,
          },
          {
            text: "Houses",
            href: "/house-meets/houses",
            icon: <Building2 className="h-4 w-4" />,
          },
          {
            text: "Squads",
            href: "/house-meets/squads",
            icon: <Flag className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
