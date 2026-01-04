"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui";
import { MainNavigation, MobileBottomNav, MobileHeader } from "@/components/layout";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
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
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { data: user, isLoading: isUserLoading, isError } = useCurrentUser();

  useEffect(() => {
    const isLoginPage = pathname === "/login";
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (!isLoginPage) {
      if (!token) {
        router.replace("/login");
      } else if (isError) {
        // If query fails (e.g. 401 after refresh failed)
        localStorage.clear();
        router.replace("/login");
      } else if (!isUserLoading && user) {
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [pathname, user, isUserLoading, isError, router]);

  // If we're on a protected page and still loading user or checking token
  if (pathname !== "/login" && (isUserLoading || isCheckingAuth)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If on login page, just render children (LoginForm) without the shell chrome
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      {/* Desktop Sidebar */}
      {!isMobile && <MainNavigation />}

      {/* Main area */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="flex h-14 items-center gap-4 border-b bg-white px-6 sticky top-0 z-30 shadow-sm/5 flex-shrink-0">
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
          "flex-1 bg-slate-50/50 min-h-0 flex flex-col",
          isMobile ? "overflow-auto pb-20" : "overflow-hidden"
        )}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </SidebarInset>
    </SidebarProvider>
  );
}
