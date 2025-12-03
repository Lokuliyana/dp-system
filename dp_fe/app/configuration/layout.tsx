"use client";

import { 
  GraduationCap, 
  Building2, 
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { ModuleLayout } from "@/components/layout/module-layout";

const NAV_ITEMS = [
  { label: "Overview", href: "/configuration", icon: LayoutDashboard, exact: true },
  { label: "Academics", href: "/configuration/academics", icon: GraduationCap },
  { label: "School Structure", href: "/configuration/structure", icon: Building2 },
  { label: "Roles & Permissions", href: "/configuration/roles", icon: ShieldCheck },
];

import { ConfigurationSidebar } from "@/components/configuration/configuration-sidebar";
import { SidebarProvider } from "@/components/ui";

export default function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="min-h-full">
      <div className="flex min-h-full w-full">
        <ConfigurationSidebar />
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
