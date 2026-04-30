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
import { Loader2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/layout/user-nav"
import { LoginModal } from "@/components/auth/login-modal"


interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: user, isLoading: isUserLoading, isError, refetch } = useCurrentUser();

  useEffect(() => {
    const isLoginPage = pathname === "/login";
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (!isLoginPage) {
      if (!token) {
        setShowLoginModal(true);
        setIsCheckingAuth(false);
      } else if (isError) {
        localStorage.clear();
        setShowLoginModal(true);
        setIsCheckingAuth(false);
      } else if (!isUserLoading && user) {
        setIsCheckingAuth(false);
        setShowLoginModal(false);
      }
    } else {
      setIsCheckingAuth(false);
      setShowLoginModal(false);
    }
  }, [pathname, user, isUserLoading, isError]);

  if (pathname !== "/login" && (isUserLoading || isCheckingAuth)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Verifying session</p>
        </div>
      </div>
    );
  }

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
          <header className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-3 sticky top-0 z-30">
            <SidebarTrigger className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <UserNav />
            </div>
          </header>
        )}

        {/* Mobile Header */}
        {isMobile && <MobileHeader />}

        {/* Scrollable content area */}
        <main className={cn(
          "flex-1 bg-slate-50 min-h-0 flex flex-col",
          isMobile ? "overflow-auto pb-[65px]" : "overflow-hidden"
        )}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </SidebarInset>

      <LoginModal
        isOpen={showLoginModal}
        onSuccess={() => {
          setShowLoginModal(false);
          refetch();
        }}
      />
    </SidebarProvider>
  );
}
