"use client";

import { ReactNode, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutContext } from "./context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu as MenuIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface InnerLayoutProps {
  children: ReactNode;
}

export function InnerLayout({ children }: InnerLayoutProps) {
  const isMobile = useIsMobile();
  const [isInnerNavOpen, setIsInnerNavOpen] = useState(false);

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
    }),
    [pageTitle]
  );

  return (
    <LayoutContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
          {/* Mobile Inner Navigation Dropdown Overlay */}
          {isMobile && (showMainMenu || showHorizontalToolbar || showSidebar) && (
            <div className="relative z-40 border-b bg-white/80 backdrop-blur-sm">
              <Collapsible open={isInnerNavOpen} onOpenChange={setIsInnerNavOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-between px-4 py-2 h-10 hover:bg-muted/10"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <MenuIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                          {pageTitle || "Page Navigation"}
                        </span>
                        <span className="text-[11px] font-medium text-foreground/60 leading-none mt-0.5">
                          {isInnerNavOpen ? "Close Menu" : "View Options"}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                      isInnerNavOpen ? "bg-primary text-white rotate-180" : "bg-muted text-muted-foreground"
                    )}>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                {/* Absolute Overlay for Mobile Navigation */}
                <div className="absolute top-full left-0 right-0 z-50 overflow-hidden pointer-events-none">
                  {/* Backdrop */}
                  <div 
                    className={cn(
                      "fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto",
                      isInnerNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => setIsInnerNavOpen(false)}
                  />
                  
                  <CollapsibleContent className="relative bg-white border-b shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                    <div className="p-4 space-y-6">
                      {showMainMenu && (
                        <div className="space-y-2">
                          {mainMenuActions}
                        </div>
                      )}
                      {showHorizontalToolbar && horizontalToolbarActions && (
                        <div className="pt-4 border-t border-dashed">
                          {horizontalToolbarActions}
                        </div>
                      )}
                      {showSidebar && sidebarActions && (
                        <div className="pt-4 border-t border-dashed">
                          {sidebarActions}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          )}

          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Desktop Sidebars - COMPACTED */}
            {!isMobile && showMainMenu && (
              <div className="w-[180px] bg-muted/20 border-r border-border flex-shrink-0 overflow-y-auto">
                {mainMenuActions}
              </div>
            )}

            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
              {/* Desktop Horizontal Toolbar - COMPACTED */}
              {!isMobile && showHorizontalToolbar && (
                <div className="w-full flex items-center px-4 py-1.5 bg-background border-b border-border min-h-[44px]">
                  {horizontalToolbarActions}
                </div>
              )}

              <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Desktop Vertical Toolbar - COMPACTED */}
                {!isMobile && showVerticalToolbar && (
                  <div className="w-[40px] pt-3 bg-muted/20 border-r border-border flex-shrink-0 flex flex-col items-center gap-3">
                    {verticalToolbarActions}
                  </div>
                )}

                {/* Desktop Inner Sidebar - COMPACTED */}
                {!isMobile && showSidebar && (
                  <div className="w-[200px] bg-background border-r border-border flex-shrink-0 overflow-hidden flex flex-col">
                    {sidebarActions}
                  </div>
                )}

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                  <ScrollArea className="h-full w-full" {...mainAreaProps}>
                    <div className="p-0">
                      {children}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </LayoutContext.Provider>
  );
}
