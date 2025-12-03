"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Shield,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui";

const CONFIG_ITEMS = [
  {
    title: "Overview",
    url: "/configuration",
    icon: LayoutDashboard,
  },
  {
    title: "Academics",
    url: "/configuration/academics",
    icon: GraduationCap,
  },
  {
    title: "Roles & Permissions",
    url: "/configuration/roles",
    icon: Shield,
  },
  {
    title: "Structure",
    url: "/configuration/structure",
    icon: Building2,
  },
];

export function ConfigurationSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="w-64 border-r bg-muted/30">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CONFIG_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
