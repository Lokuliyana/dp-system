// components/common/main-navigation.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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

import { usePermission } from "@/hooks/usePermission";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  group: "overview" | "academics" | "engagement" | "people" | "insights";
  permission?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home, group: "overview" },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar, group: "overview", permission: "activities.event.read" },
  { id: "students", label: "Students", href: "/students", icon: Users, group: "academics", permission: "student.student.read" },
  { id: "attendance", label: "Attendance", href: "/attendance", icon: Calendar, group: "academics", permission: "student.attendance.read" },
  { id: "exams", label: "Exam Results", href: "/exams", icon: FileText, group: "academics", permission: "student.exam_result.read" },
  { id: "house-meets", label: "House Meets", href: "/house-meets", icon: Trophy, group: "engagement", permission: "housemeets.house.read" },
  { id: "champions", label: "Champions", href: "/champions", icon: Trophy, group: "engagement", permission: "housemeets.competition_result.read" },
  { id: "activities", label: "Activities", href: "/activities", icon: Award, group: "engagement", permission: "activities.club.read" },
  { id: "staff", label: "Staff", href: "/staff", icon: Users, group: "people", permission: "staff.teacher.read" },
  { id: "prefects", label: "Prefects", href: "/prefects", icon: Crown, group: "people", permission: "staff.prefect.read" },
  { id: "parents", label: "Parents", href: "/parents", icon: Users2, group: "people", permission: "student.parent.read" },
  { id: "users", label: "Users", href: "/users", icon: ShieldCheck, group: "people", permission: "system.app_user.read" },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3, group: "insights", permission: "student.report.read" },
  { id: "configuration", label: "Configuration", href: "/configuration", icon: Settings, group: "insights", permission: "system.school.read" },
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
  const { can } = usePermission();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const filteredNavItems = NAV_ITEMS.filter(item => !item.permission || can(item.permission));

  const itemsByGroup = filteredNavItems.reduce<Record<NavItem["group"], NavItem[]>>(
    (acc, item) => {
      acc[item.group] = acc[item.group] ? [...acc[item.group], item] : [item];
      return acc;
    },
    {} as Record<NavItem["group"], NavItem[]>,
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border py-2">
        <div className="px-3">
          {/* <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-primary/20 overflow-hidden">
              <Image src="/logo.png" alt="Sri Ananda Logo" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-foreground">Navigation</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Control Panel</span>
            </div>
          </div> */}
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
            <SidebarGroup key={groupKey} className="py-1 px-3">
              <SidebarGroupLabel className="h-5 text-[9px] uppercase tracking-widest font-bold text-slate-400/80 px-2 mb-1 group-data-[collapsible=icon]:hidden">
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
                          className="h-9 text-sm px-3 transition-all duration-200"
                        >
                          <Link href={item.href}>
                            <Icon className="!size-4" />
                            <span className="font-semibold group-data-[collapsible=icon]:hidden">{item.label}</span>
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
