"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout";
import { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface ModuleLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function ModuleLayout({
  title,
  description,
  icon,
  navItems,
  children,
}: ModuleLayoutProps) {
  const pathname = usePathname();

  return (
    <PageContainer variant="fluid" className="h-[calc(100vh-3rem)] p-0">
      <div className="flex h-full">
        {/* Module Sidebar */}
        <aside className="w-48 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-200/70">
            {icon && (() => {
              const Icon = icon;
              return (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 text-primary mb-2">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              );
            })()}
            <h2 className="text-sm font-bold text-slate-900 leading-tight">{title}</h2>
            <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">{description}</p>
          </div>
          <nav className="flex-1 py-2 px-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 mb-0.5",
                    isActive
                      ? "bg-white text-primary shadow-sm border border-slate-200/80"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                  )}
                >
                  <Icon className={cn(
                    "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-5 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
