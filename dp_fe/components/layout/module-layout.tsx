"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout";
import { Header } from "@/components/ui";
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
        {/* Sidebar */}
        <aside className="w-52 border-r border-slate-200 bg-slate-50/50 flex-shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-slate-200/50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              {icon && (() => {
                const Icon = icon;
                return <Icon className="h-4 w-4 text-slate-500" />;
              })()}
              {title}
            </h2>
            <p className="mt-1 text-[10px] text-slate-500 line-clamp-2 leading-tight">
              {description}
            </p>
          </div>
          <nav className="flex-1 py-2">
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
                    "group flex items-center gap-3 px-4 py-1.5 text-sm font-medium border-l-2 transition-colors",
                    isActive
                      ? "border-blue-600 bg-white text-slate-900"
                      : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </PageContainer>
  );
}
