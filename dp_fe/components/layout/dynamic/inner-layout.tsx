"use client";

import { ReactNode, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutContext } from "./context";

interface InnerLayoutProps {
  children: ReactNode;
}

export function InnerLayout({ children }: InnerLayoutProps) {
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
    }),
    []
  );

  return (
    <LayoutContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={100}>
        <ResizablePanelGroup direction="horizontal" className="h-full w-full bg-background">
          <ResizablePanel defaultSize={100} className="h-full flex relative">
            {/* MAIN MENU (SIDEBAR) */}
            {showMainMenu && (
              <div className="w-[200px] bg-muted/30 border-r border-border flex-shrink-0 overflow-y-auto">
                {mainMenuActions}
              </div>
            )}

            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* HORIZONTAL TOOLBAR */}
              {showHorizontalToolbar && (
                <div className="w-full flex items-center px-4 py-2 bg-background border-b border-border min-h-[56px]">
                  {horizontalToolbarActions}
                </div>
              )}

              <div className="flex-1 flex min-h-0">
                {/* VERTICAL TOOLBAR */}
                {showVerticalToolbar && (
                  <div className="w-[40px] pt-4 bg-muted/30 border-r border-border flex-shrink-0">
                    {verticalToolbarActions}
                  </div>
                )}

                {/* INNER SIDEBAR */}
                {showSidebar && (
                  <div className="w-[200px] bg-background border-r border-border flex-shrink-0 overflow-hidden flex flex-col">
                    {sidebarActions}
                  </div>
                )}

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                  <ScrollArea className="h-full w-full" {...mainAreaProps}>
                    {children}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </LayoutContext.Provider>
  );
}
