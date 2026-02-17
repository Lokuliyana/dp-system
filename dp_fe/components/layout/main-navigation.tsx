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
  Settings,
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
  { id: "users", label: "Users", href: "/users", icon: ShieldCheck, group: "people" },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3, group: "insights" },
  { id: "configuration", label: "Configuration", href: "/configuration", icon: Settings, group: "insights" },
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
      <SidebarHeader className="border-b border-sidebar-border py-4">
        <div className="px-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-foreground">Navigation</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Control Panel</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Overview, Academics, Engagement, People, Insights */}
        {(
          ["overview", "academics", "engagement", "people", "insights"] as NavItem["group"][]
        ).map((groupKey) => {
          const items = itemsByGroup[groupKey];
          if (!items || items.length === 0) return null;

          return (
            <SidebarGroup key={groupKey} className="py-2 px-3">
              <SidebarGroupLabel className="h-6 text-[10px] uppercase tracking-widest font-bold text-slate-400/80 px-2 mb-1">
                {GROUP_LABELS[groupKey]}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={active} 
                          tooltip={item.label} 
                          className="h-10 text-sm px-3 transition-all duration-200"
                        >
                          <Link href={item.href}>
                            <Icon className="!size-5" />
                            <span className="font-semibold">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-1.5">
        <div className="flex items-center justify-between px-1.5 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="font-medium">Sri Ananda v2.0</span>
          <div className="h-1 w-1 rounded-full bg-emerald-500" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
