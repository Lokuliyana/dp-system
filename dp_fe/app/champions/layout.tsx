"use client";

import { Trophy, Medal, Map, Globe } from "lucide-react";
import { ModuleLayout } from "@/components/layout/module-layout";

const NAV_ITEMS = [
  { label: "Overview", href: "/champions", icon: Trophy, exact: true },
  { label: "Zonal", href: "/champions/zonal", icon: Map },
  { label: "District", href: "/champions/district", icon: Medal },
  { label: "All Island", href: "/champions/all-island", icon: Globe },
];

export default function ChampionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModuleLayout
      title="Champions"
      description="Manage Zonal, District, and All Island competitions."
      icon={Trophy}
      navItems={NAV_ITEMS}
    >
      {children}
    </ModuleLayout>
  );
}
