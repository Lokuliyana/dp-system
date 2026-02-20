"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui";
import { MainNavigation, MobileBottomNav, MobileHeader } from "@/components/layout"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useCurrentUser } from "@/hooks/useAuth"
import { Loader2, BookOpen, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { UserNav } from "@/components/layout/user-nav"

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
          <header className="flex h-12 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 sticky top-0 z-30 shadow-sm flex-shrink-0">
            <SidebarTrigger className="h-8 w-8 hover:bg-slate-100 transition-colors rounded-lg" />
            
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] text-primary-foreground transform group-hover:rotate-6 transition-transform overflow-hidden">
                  <Image src="/logo.png" alt="Sri Ananda Logo" width={32} height={32} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-base font-black tracking-tight text-slate-900 leading-tight">SRI ANANDA</span>
                  <div className="flex items-center gap-1.5 mt-[-1px]">
                    <div className="h-[1px] w-4 bg-slate-300" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Admin Console</span>
                    <div className="h-[1px] w-4 bg-slate-300" />
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <UserNav />
            </div>
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
