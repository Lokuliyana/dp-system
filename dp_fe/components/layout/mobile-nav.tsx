"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  MoreHorizontal,
  Trophy,
  Crown,
  Award,
  Users2,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const BOTTOM_NAV_ITEMS = [
  { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
  { id: "students", label: "Students", href: "/students", icon: Users },
  { id: "attendance", label: "Attendance", href: "/attendance", icon: Calendar, hidden: false },
  { id: "staff", label: "Staff", href: "/staff", icon: Users, hidden: false },
];

const ALL_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home, group: "Overview" },
  { id: "students", label: "Students", href: "/students", icon: Users, group: "Academics" },
  { id: "attendance", label: "Attendance", href: "/attendance", icon: Calendar, group: "Academics" },
  { id: "house-meets", label: "House Meets", href: "/house-meets", icon: Trophy, group: "Engagement" },
  { id: "champions", label: "Champions", href: "/champions", icon: Trophy, group: "Engagement" },
  { id: "activities", label: "Activities", href: "/activities", icon: Award, group: "Engagement" },
  { id: "staff", label: "Staff", href: "/staff", icon: Users, group: "People" },
  { id: "prefects", label: "Prefects", href: "/prefects", icon: Crown, group: "People" },
  { id: "parents", label: "Parents", href: "/parents", icon: Users2, group: "People" },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3, group: "Insights" },
  { id: "configuration", label: "Configuration", href: "/configuration", icon: ShieldCheck, group: "Insights" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white/95 px-2 pb-safe backdrop-blur-lg md:hidden">
      {BOTTOM_NAV_ITEMS.filter(item => !(item as any).hidden).map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className="relative flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-1 transition-colors"
          >
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.1 : 1,
                color: active ? "var(--primary)" : "var(--muted-foreground)",
              }}
              className="flex flex-col items-center"
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
              <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
            </motion.div>
            {active && (
              <motion.div
                layoutId="active-pill"
                className="absolute -top-1 h-1 w-8 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}

      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-1 text-muted-foreground transition-colors active:scale-90">
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-tight">More</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] p-0 outline-none">
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-slate-200" />
          <SheetHeader className="p-6 text-left">
            <SheetTitle className="text-2xl font-bold">Explore</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full px-6 pb-20">
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {ALL_NAV_ITEMS.filter(item => !(item as any).hidden).map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all active:scale-95",
                          active ? "border-primary/20 bg-primary/5 text-primary shadow-sm" : "border-slate-100 bg-slate-50/50 text-slate-600"
                        )}
                      >
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                          active ? "bg-primary/10" : "bg-white shadow-sm"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-center text-[11px] font-bold leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur-md md:hidden">
      <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary/20 text-white overflow-hidden">
          <Image src="/logo.png" alt="Sri Ananda Logo" width={40} height={40} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold leading-none tracking-tight">Sri Ananda</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Admin Console</span>
        </div>
      </Link>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5 text-slate-600" />
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Button>
        <div className="ml-1 h-9 w-9 rounded-full border-2 border-primary/10 bg-slate-100 p-0.5">
          <div className="h-full w-full rounded-full bg-slate-200" />
        </div>
      </div>
    </header>
  );
}
