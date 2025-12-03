"use client";

import { Users2 } from "lucide-react";
import { MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";

export function ParentsMenu() {
  return (
    <MainMenu>
      <MainMenuTitle>Parents Management</MainMenuTitle>
      <MainMenuItem
        items={[
          {
            text: "Parents Directory",
            href: "/parents",
            icon: <Users2 className="h-4 w-4" />,
          },
        ]}
      />
    </MainMenu>
  );
}
