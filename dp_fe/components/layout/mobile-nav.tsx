"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  LayoutGrid,
  Trophy,
  Crown,
  Award,
  Users2,
  BarChart3,
  ShieldCheck,
  FileText,
  Settings,
  Bell,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserNav } from "@/components/layout/user-nav";

const BOTTOM_NAV_ITEMS = [
  { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
  { id: "students", label: "Students", href: "/students", icon: Users },
  { id: "house-meets", label: "House Meets", href: "/house-meets", icon: Trophy },
  { id: "staff", label: "Staff", href: "/staff", icon: Users2 },
];

const ALL_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
      { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Academics",
    items: [
      { id: "students", label: "Students", href: "/students", icon: Users },
      { id: "attendance", label: "Attendance", href: "/attendance", icon: Calendar },
      { id: "exams", label: "Exam Results", href: "/exams", icon: FileText },
    ],
  },
  {
    label: "Engagement",
    items: [
      { id: "house-meets", label: "House Meets", href: "/house-meets", icon: Trophy },
      { id: "champions", label: "Champions", href: "/champions", icon: Crown },
      { id: "activities", label: "Activities", href: "/activities", icon: Award },
    ],
  },
  {
    label: "People",
    items: [
      { id: "staff", label: "Staff", href: "/staff", icon: Users2 },
      { id: "prefects", label: "Prefects", href: "/prefects", icon: Crown },
      { id: "parents", label: "Parents", href: "/parents", icon: Users },
      { id: "users", label: "Users", href: "/users", icon: ShieldCheck },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
      { id: "configuration", label: "Configuration", href: "/configuration", icon: Settings },
    ],
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Safe area padding */}
      <div className="border-t border-slate-200 bg-white/98 backdrop-blur-xl shadow-[0_-1px_0_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-1 pb-safe">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-2 px-2"
              >
                <div className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "text-slate-500"
                )}>
                  {active && (
                    <motion.div
                      layoutId="mobile-active-bg"
                      className="absolute inset-0 rounded-xl bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <Icon className={cn("relative z-10 h-5 w-5", active && "text-white")} />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold transition-colors",
                  active ? "text-primary" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-2 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors active:bg-slate-100">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0 border-0 outline-none shadow-2xl">
              {/* Handle bar */}
              <div className="flex justify-center pt-2.5 pb-1">
                <div className="h-1 w-10 rounded-full bg-slate-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">All Sections</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Navigate to any module</p>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              <ScrollArea className="h-[calc(80vh-80px)]">
                <div className="px-4 py-3 pb-10">
                  {ALL_NAV_GROUPS.map((group) => (
                    <div key={group.label} className="mb-5">
                      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.href);
                          return (
                            <SheetClose asChild key={item.id}>
                              <Link
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98]",
                                  active
                                    ? "bg-primary/8 text-primary"
                                    : "text-slate-700 hover:bg-slate-50"
                                )}
                              >
                                <div className={cn(
                                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                                  active ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-500"
                                )}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className={cn(
                                  "flex-1 text-sm font-semibold",
                                  active ? "text-primary" : "text-slate-800"
                                )}>
                                  {item.label}
                                </span>
                                <ChevronRight className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  active ? "text-primary/60" : "text-slate-300"
                                )} />
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md md:hidden shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
      <Link href="/dashboard" className="flex items-center gap-2.5 active:opacity-70 transition-opacity">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden ring-1 ring-slate-200 shadow-sm">
          <Image src="/logo.png" alt="Sri Ananda" width={32} height={32} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-black tracking-tight text-slate-900">SRI ANANDA</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Admin Console</span>
        </div>
      </Link>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
        </Button>
        <div className="ml-1">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
