"use client";

import React, { ReactNode, useEffect } from "react";
import { useInnerLayoutControls } from "./context";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// --- Horizontal Toolbar ---

const HorizontalToolbarWrapper = ({ children }: { children: ReactNode }) => {
  const { setHorizontalToolbarActions } = useInnerLayoutControls();

  useEffect(() => {
    setHorizontalToolbarActions(children);
    return () => setHorizontalToolbarActions(null);
  }, [setHorizontalToolbarActions, children]);

  return null;
};

export interface MenuBarProps extends React.ComponentProps<"div"> {
  children: ReactNode;
}

export const HorizontalToolbar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ children, className, ...props }, ref) => {
    const isMobile = useIsMobile();
    return (
      <HorizontalToolbarWrapper>
        <div
          className={cn(
            "w-full flex gap-2 justify-between",
            isMobile ? "flex-col items-stretch" : "flex-row items-center",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </HorizontalToolbarWrapper>
    );
  }
);
HorizontalToolbar.displayName = "HorizontalToolbar";

export const HorizontalToolbarTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
});
HorizontalToolbarTitle.displayName = "HorizontalToolbarTitle";

export const HorizontalToolbarIcons = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2",
        isMobile ? "flex-wrap" : "flex-row",
        className
      )}
      {...props}
    />
  );
});
HorizontalToolbarIcons.displayName = "HorizontalToolbarIcons";

// --- Vertical Toolbar ---

const VerticalToolbarWrapper = ({ children }: { children: ReactNode }) => {
  const { setVerticalToolbarActions } = useInnerLayoutControls();

  useEffect(() => {
    setVerticalToolbarActions(children);
    return () => setVerticalToolbarActions(null);
  }, [setVerticalToolbarActions, children]);

  return null;
};

export const VerticalToolbar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <VerticalToolbarWrapper>
        <div
          className={cn(
            "w-full flex flex-col items-center gap-2 py-2",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </VerticalToolbarWrapper>
    );
  }
);
VerticalToolbar.displayName = "VerticalToolbar";

// --- Main Menu ---

const MainMenuWrapper = ({ children }: { children: ReactNode }) => {
  const { setMainMenubarActions } = useInnerLayoutControls();

  useEffect(() => {
    setMainMenubarActions(children);
    return () => setMainMenubarActions(null);
  }, [setMainMenubarActions, children]);

  return null;
};

export const MainMenu = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <MainMenuWrapper>
        <div className={cn("w-full", className)} ref={ref} {...props}>
          {children}
        </div>
      </MainMenuWrapper>
    );
  }
);
MainMenu.displayName = "MainMenu";

export const MainMenuTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest", className)}
      {...props}
    />
  );
});
MainMenuTitle.displayName = "MainMenuTitle";

interface MenuItem {
  text: string;
  icon?: ReactNode;
  href: string;
  subMenus?: MenuItem[];
}

interface MainMenuItemProps extends React.ComponentProps<"div"> {
  items: MenuItem[];
}

export const MainMenuItem = React.forwardRef<HTMLDivElement, MainMenuItemProps>(
  ({ items, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-0.5", className)} {...props}>
        {items.map((item, index) => (
          <div key={index}>
            {item.subMenus && item.subMenus.length > 0 ? (
              <Collapsible className="group/collapsible">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="opacity-80">{item.icon}</span>}
                    {item.text}
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-3 pt-0.5">
                  <MainMenuItem items={item.subMenus} />
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                {item.icon && <span className="opacity-80">{item.icon}</span>}
                {item.text}
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  }
);
MainMenuItem.displayName = "MainMenuItem";
