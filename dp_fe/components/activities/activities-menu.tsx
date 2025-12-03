"use client";

import { Award, Trophy } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function ActivitiesMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Activities</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Clubs & Societies",
            href: "/activities/clubs",
            icon: <Award className="h-4 w-4" />,
          },
          {
            text: "Events",
            href: "/activities/events",
            icon: <Trophy className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
