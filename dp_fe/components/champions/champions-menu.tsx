import { Map, Medal, Globe, LayoutDashboard } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { usePermission } from "@/hooks/usePermission";

export function ChampionsMenu() {
  const { can } = usePermission();
  
  const items = [
    {
      text: "Overview",
      href: "/champions",
      icon: <LayoutDashboard className="h-4 w-4" />,
      permission: "housemeets.competition_result.read",
    },
    {
      text: "Zonal Level",
      href: "/champions/zonal",
      icon: <Map className="h-4 w-4" />,
      permission: "housemeets.competition_result.read",
    },
    {
      text: "District Level",
      href: "/champions/district",
      icon: <Medal className="h-4 w-4" />,
      permission: "housemeets.competition_result.read",
    },
    {
      text: "All Island Level",
      href: "/champions/all-island",
      icon: <Globe className="h-4 w-4" />,
      permission: "housemeets.competition_result.read",
    },
  ].filter(i => !i.permission || can(i.permission));

  if (items.length === 0) return null;

  return (
    <MainMenu>
      <MainMenuTitle>Champions Dashboard</MainMenuTitle>
      <MainMenuItem items={items} />
    </MainMenu>
  );
}
