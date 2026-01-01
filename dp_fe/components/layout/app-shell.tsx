"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui";
import { MainNavigation, MobileBottomNav, MobileHeader } from "@/components/layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Global application shell for the admin console.
 * Handles sidebar, chrome, and top header – pages only render their content.
 */
export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen>
      {/* Desktop Sidebar */}
      {!isMobile && <MainNavigation />}

      {/* Main area */}
      <SidebarInset className="flex flex-col min-h-screen">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="flex h-14 items-center gap-4 border-b bg-white px-6 sticky top-0 z-30 shadow-sm/5">
            <SidebarTrigger className="h-9 w-9" />
            <div className="flex-1" />
            {/* Add user profile / search here for desktop */}
            <div className="h-9 w-9 rounded-full bg-slate-100 border shadow-sm" />
          </header>
        )}

        {/* Mobile Header */}
        {isMobile && <MobileHeader />}

        {/* Scrollable content area */}
        <main className={cn(
          "flex-1 overflow-auto bg-slate-50/50",
          isMobile ? "pb-20" : ""
        )}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </SidebarInset>
    </SidebarProvider>
  );
}
