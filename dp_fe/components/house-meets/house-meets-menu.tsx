"use client";

import { usePermission } from "@/hooks/usePermission";
import { LayoutDashboard, Users, Trophy, Medal, History as HistoryIcon, Building2, Flag } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function HouseMeetsMenu() {
  const { can } = usePermission();

  const mainItems = [
    {
      text: "Dashboard",
      href: "/house-meets",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      text: "Assignments",
      href: "/house-meets/assignments",
      icon: <Users className="h-4 w-4" />,
      permission: "housemeets.student_house_assignment.read",
    },
    {
      text: "Registrations",
      href: "/house-meets/registrations",
      icon: <Trophy className="h-4 w-4" />,
      permission: "housemeets.competition_registration.read",
    },
    {
      text: "Results",
      href: "/house-meets/results",
      icon: <Medal className="h-4 w-4" />,
      permission: "housemeets.competition_result.read",
    },
    {
      text: "History",
      href: "/house-meets/history",
      icon: <HistoryIcon className="h-4 w-4" />,
      permission: "housemeets.competition_result.read",
    },
  ].filter(item => !item.permission || can(item.permission));

  const configItems = [
    {
      text: "Competitions",
      href: "/house-meets/competitions",
      icon: <Trophy className="h-4 w-4" />,
      permission: "housemeets.competition.read",
    },
    {
      text: "Houses",
      href: "/house-meets/houses",
      icon: <Building2 className="h-4 w-4" />,
      permission: "housemeets.house.read",
    },
    {
      text: "Squads",
      href: "/house-meets/squads",
      icon: <Flag className="h-4 w-4" />,
      permission: "activities.squad.read",
    },
  ].filter(item => !item.permission || can(item.permission));

  return (
    <MainMenu>
      <MainMenuTitle>House Meets</MainMenuTitle>
      <MainMenuItem items={mainItems} />

      {configItems.length > 0 && (
        <>
          <MainMenuTitle>Configuration</MainMenuTitle>
          <MainMenuItem items={configItems} />
        </>
      )}
    </MainMenu>
  );
}
