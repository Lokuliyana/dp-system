"use client";

import { Award, Trophy } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { usePermission } from "@/hooks/usePermission";

export function ActivitiesMenu() {
  const { can } = usePermission();
  
  const items = [
    {
      text: "Clubs & Societies",
      href: "/activities/clubs",
      icon: <Award className="h-4 w-4" />,
      permission: "activities.club.read",
    },
    {
      text: "Events",
      href: "/activities/events",
      icon: <Trophy className="h-4 w-4" />,
      permission: "activities.event.read",
    },
  ].filter(i => !i.permission || can(i.permission));

  if (items.length === 0) return null;

  return (
    <MainMenu>
      <MainMenuTitle>Activities</MainMenuTitle>
      <MainMenuItem items={items} />
    </MainMenu>
  );
}
