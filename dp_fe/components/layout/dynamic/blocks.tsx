"use client";

import React, { ReactNode, useEffect } from "react";
import { useInnerLayoutControls } from "./context";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
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
            "w-full flex flex-row items-center justify-between gap-2",
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
      className={cn("flex items-center gap-2 flex-wrap", className)}
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
  React.ComponentProps<"div"> & { moduleLabel?: boolean }
>(({ className, children, moduleLabel = false, ...props }, ref) => {
  const { setModuleTitle } = useInnerLayoutControls();

  useEffect(() => {
    // Only the first/primary MainMenuTitle should set the module title
    if (moduleLabel && typeof children === "string") {
      setModuleTitle(children);
      return () => setModuleTitle(null);
    }
  }, [children, moduleLabel, setModuleTitle]);

  return (
    <div
      ref={ref}
      className={cn(
        "px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
MainMenuTitle.displayName = "MainMenuTitle";

interface MenuItem {
  text: string;
  icon?: ReactNode;
  href: string;
  subMenus?: MenuItem[];
  active?: boolean;
}

interface MainMenuItemProps extends React.ComponentProps<"div"> {
  items: MenuItem[];
}

export const MainMenuItem = React.forwardRef<HTMLDivElement, MainMenuItemProps>(
  ({ items, className, ...props }, ref) => {
    const pathname = usePathname();

    return (
      <div ref={ref} className={cn("space-y-0.5 px-2", className)} {...props}>
        {items.map((item, index) => {
          const isActive = item.active !== undefined
            ? item.active
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <div key={index}>
              {item.subMenus && item.subMenus.length > 0 ? (
                <Collapsible className="group/collapsible">
                  <CollapsibleTrigger className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}>
                    <div className="flex items-center gap-2.5">
                      {item.icon && (
                        <span className={cn("opacity-70", isActive && "opacity-100 text-primary")}>
                          {item.icon}
                        </span>
                      )}
                      {item.text}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90 text-slate-400" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-3 pt-0.5">
                    <MainMenuItem items={item.subMenus} />
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.icon && (
                    <span className={cn("opacity-70 flex-shrink-0", isActive && "opacity-100 text-primary")}>
                      {item.icon}
                    </span>
                  )}
                  <span>{item.text}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
MainMenuItem.displayName = "MainMenuItem";
