"use client";

import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInnerLayoutControls } from "./context";

interface LayoutControllerProps
  extends React.ComponentPropsWithoutRef<typeof ScrollArea> {
  showMainMenu?: boolean;
  showHorizontalToolbar?: boolean;
  showVerticalToolbar?: boolean;
  showSidebar?: boolean;
}

export const LayoutController = React.forwardRef<
  HTMLDivElement,
  LayoutControllerProps
>(({ children, showMainMenu, showHorizontalToolbar, showVerticalToolbar, showSidebar, ...props }, ref) => {
  const {
    setMainAreaProps,
    setShowMainMenu,
    setShowHorizontalToolbar,
    setShowVerticalToolbar,
    setShowSidebar,
  } = useInnerLayoutControls();

  useEffect(() => {
    setMainAreaProps(props);
    setShowMainMenu(showMainMenu || false);
    setShowHorizontalToolbar(showHorizontalToolbar || false);
    setShowVerticalToolbar(showVerticalToolbar || false);
    setShowSidebar(showSidebar || false);

    return () => {
      setMainAreaProps({});
      // Optionally reset visibility on unmount, or leave it to the next page to set
      // For safety, we can reset to false
      setShowMainMenu(false);
      setShowHorizontalToolbar(false);
      setShowVerticalToolbar(false);
      setShowSidebar(false);
    };
  }, [
    setMainAreaProps,
    setShowMainMenu,
    setShowHorizontalToolbar,
    setShowVerticalToolbar,
    setShowSidebar,
    showMainMenu,
    showHorizontalToolbar,
    showVerticalToolbar,
    showSidebar,
    // props is intentionally omitted from dependency array to avoid deep comparison issues
    // unless we memoize props in the parent. 
    // If props change dynamically, we might need a deep compare or specific prop checks.
  ]);

  return <div ref={ref}>{children}</div>;
});

LayoutController.displayName = "LayoutController";
