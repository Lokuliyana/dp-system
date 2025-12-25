// components/common/main-navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  Trophy,
  Crown,
  Award,
  Users2,
  BarChart3,
  BookOpen,
  FileText,
  ShieldCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  group: "overview" | "academics" | "engagement" | "people" | "insights";
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home, group: "overview" },
  { id: "students", label: "Students", href: "/students", icon: Users, group: "academics" },
  { id: "attendance", label: "Attendance", href: "/attendance", icon: Calendar, group: "academics" },
  { id: "house-meets", label: "House Meets", href: "/house-meets", icon: Trophy, group: "engagement" },
  { id: "champions", label: "Champions", href: "/champions", icon: Trophy, group: "engagement" },
  { id: "activities", label: "Activities", href: "/activities", icon: Award, group: "engagement" },
  { id: "staff", label: "Staff", href: "/staff", icon: Users, group: "people" },
  { id: "prefects", label: "Prefects", href: "/prefects", icon: Crown, group: "people" },
  { id: "parents", label: "Parents", href: "/parents", icon: Users2, group: "people" },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3, group: "insights" },
  { id: "configuration", label: "Configuration", href: "/configuration", icon: ShieldCheck, group: "insights" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  overview: "Overview",
  academics: "Academics",
  engagement: "Engagement",
  people: "People",
  insights: "Insights",
};

export function MainNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const itemsByGroup = NAV_ITEMS.reduce<Record<NavItem["group"], NavItem[]>>(
    (acc, item) => {
      acc[item.group] = acc[item.group] ? [...acc[item.group], item] : [item];
      return acc;
    },
    {} as Record<NavItem["group"], NavItem[]>,
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <Link href="/" className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">EduMIS</span>
            <span className="truncate text-xs text-muted-foreground">
              School Management
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Overview, Academics, Engagement, People, Insights */}
        {(
          ["overview", "academics", "engagement", "people", "insights"] as NavItem["group"][]
        ).map((groupKey) => {
          const items = itemsByGroup[groupKey];
          if (!items || items.length === 0) return null;

          return (
            <SidebarGroup key={groupKey} className="py-1">
              <SidebarGroupLabel className="h-6">
                {GROUP_LABELS[groupKey]}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label} size="sm">
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              {groupKey !== "insights" && <SidebarSeparator className="my-1" />}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-1">
        <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span>School Management System</span>
          <span className="text-[10px]">v2.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
