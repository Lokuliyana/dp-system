"use client";

import React, { useEffect } from "react";
import { HorizontalToolbar, HorizontalToolbarTitle } from "./blocks";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useInnerLayoutControls } from "./context";

interface DynamicPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  className?: string;
}

export function DynamicPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
}: DynamicPageHeaderProps) {
  const { setPageTitle } = useInnerLayoutControls();

  useEffect(() => {
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);

  return (
    <HorizontalToolbar className={cn("h-11 px-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <HorizontalToolbarTitle className="text-sm font-bold tracking-tight">
              {title}
            </HorizontalToolbarTitle>
            {subtitle && (
              <>
                <Separator orientation="vertical" className="h-3 mx-1" />
                <span className="text-[11px] font-medium text-muted-foreground">{subtitle}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}
      </div>
    </HorizontalToolbar>
  );
}
