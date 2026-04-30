"use client";

import { ReactNode, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutContext } from "./context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LayoutGrid, ChevronRight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface InnerLayoutProps {
  children: ReactNode;
}

export function InnerLayout({ children }: InnerLayoutProps) {
  const isMobile = useIsMobile();
  const [isNavSheetOpen, setIsNavSheetOpen] = useState(false);

  const [horizontalToolbarActions, setHorizontalToolbarActions] =
    useState<ReactNode>(null);
  const [verticalToolbarActions, setVerticalToolbarActions] =
    useState<ReactNode>(null);
  const [mainMenuActions, setMainMenubarActions] = useState<ReactNode>(null);
  const [sidebarActions, setSidebarActions] = useState<ReactNode>(null);

  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showHorizontalToolbar, setShowHorizontalToolbar] = useState(false);
  const [showVerticalToolbar, setShowVerticalToolbar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState<string | null>(null);

  const [mainAreaProps, setMainAreaProps] = useState<
    React.ComponentPropsWithoutRef<typeof ScrollArea>
  >({});

  const contextValue = useMemo(
    () => ({
      setHorizontalToolbarActions,
      setVerticalToolbarActions,
      setMainMenubarActions,
      setSidebarActions,
      setShowMainMenu,
      setShowHorizontalToolbar,
      setShowVerticalToolbar,
      setShowSidebar,
      setMainAreaProps,
      setPageTitle,
      pageTitle,
      setModuleTitle,
      moduleTitle,
    }),
    [pageTitle, moduleTitle]
  );

  const hasNav = showMainMenu || showSidebar;

  return (
    <LayoutContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">

          {/* ── MOBILE LAYOUT ── */}
          {isMobile && (
            <>
              {/* Module Nav Bar — always visible when there is inner nav */}
              {hasNav && (
                <div className="sticky top-0 z-40 flex h-10 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {moduleTitle && (
                      <>
                        <span className="text-xs font-bold text-slate-400 truncate max-w-[80px]">
                          {moduleTitle}
                        </span>
                        {pageTitle && (
                          <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                        )}
                      </>
                    )}
                    {pageTitle && (
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {pageTitle}
                      </span>
                    )}
                    {!moduleTitle && !pageTitle && (
                      <span className="text-xs font-bold text-slate-500">Navigation</span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex-shrink-0"
                    onClick={() => setIsNavSheetOpen(true)}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Menu
                  </Button>
                </div>
              )}

              {/* Horizontal Toolbar — page actions strip (filters, selects, search) */}
              {showHorizontalToolbar && horizontalToolbarActions && (
                <div className="flex-shrink-0 border-b border-slate-100 bg-white">
                  <div className="overflow-x-auto">
                    <div className="flex items-center gap-2 px-4 py-2 min-w-max">
                      {horizontalToolbarActions}
                    </div>
                  </div>
                </div>
              )}

              {/* Page Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full w-full" {...mainAreaProps}>
                  <div className="min-h-full">
                    {children}
                  </div>
                </ScrollArea>
              </div>

              {/* Navigation Bottom Sheet */}
              <Sheet open={isNavSheetOpen} onOpenChange={setIsNavSheetOpen}>
                <SheetContent
                  side="bottom"
                  className="h-[72vh] rounded-t-2xl p-0 border-0 outline-none shadow-2xl"
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-2.5 pb-1">
                    <div className="h-1 w-10 rounded-full bg-slate-200" />
                  </div>

                  {/* Sheet Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        {moduleTitle || "Navigation"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">Select a section</p>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Nav Items */}
                  <ScrollArea className="h-[calc(72vh-80px)]">
                    <div
                      className="py-3 pb-10"
                      onClick={() => setIsNavSheetOpen(false)}
                    >
                      {showMainMenu && mainMenuActions}
                      {showSidebar && sidebarActions}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </>
          )}

          {/* ── DESKTOP LAYOUT ── */}
          {!isMobile && (
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Desktop Left Sidebar */}
              {showMainMenu && (
                <div className="w-[220px] bg-slate-50 border-r border-slate-200/70 flex-shrink-0 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="py-2">
                      {mainMenuActions}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Desktop Horizontal Toolbar */}
                {showHorizontalToolbar && (
                  <div className="flex-shrink-0 flex items-center px-6 bg-white border-b border-slate-200/70 sticky top-0 z-20 min-h-[52px]">
                    {horizontalToolbarActions}
                  </div>
                )}

                <div className="flex-1 flex min-h-0 overflow-hidden">
                  {/* Desktop Vertical Toolbar */}
                  {showVerticalToolbar && (
                    <div className="w-14 pt-4 bg-slate-50/50 border-r border-slate-200/60 flex-shrink-0 flex flex-col items-center gap-4">
                      {verticalToolbarActions}
                    </div>
                  )}

                  {/* Desktop Inner Sidebar */}
                  {showSidebar && (
                    <div className="w-[260px] bg-white border-r border-slate-200/70 flex-shrink-0 overflow-hidden flex flex-col">
                      <ScrollArea className="flex-1">
                        <div className="p-2">
                          {sidebarActions}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 overflow-hidden">
                    <ScrollArea className="h-full w-full" {...mainAreaProps}>
                      <div className="min-h-full">
                        {children}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </TooltipProvider>
    </LayoutContext.Provider>
  );
}
