// components/common/app-shell.tsx
"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui";
import { MainNavigation } from "@/components/layout";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Global application shell for the admin console.
 * Handles sidebar, chrome, and top header – pages only render their content.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      {/* Left sidebar navigation */}
      <MainNavigation />

      {/* Main area */}
      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-12 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger />
          {/* Optional: breadcrumb / page title component here */}
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
