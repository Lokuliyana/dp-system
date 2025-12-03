"use client";

import React, { ReactNode, useEffect } from "react";
import { useInnerLayoutControls } from "./context";
import { cn } from "@/lib/utils";
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
    return (
      <HorizontalToolbarWrapper>
        <div
          className={cn(
            "w-full flex items-center gap-2 justify-between",
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
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
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
            "w-full flex flex-col items-center gap-4 py-2",
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
        <div className={cn("w-full py-2", className)} ref={ref} {...props}>
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
      className={cn("px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", className)}
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
      <div ref={ref} className={cn("space-y-1 px-2", className)} {...props}>
        {items.map((item, index) => (
          <div key={index}>
            {item.subMenus && item.subMenus.length > 0 ? (
              <Collapsible className="group/collapsible">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.text}
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  <MainMenuItem items={item.subMenus} />
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.icon}
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
