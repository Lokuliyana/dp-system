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
    <HorizontalToolbar className={cn("h-16 px-6", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <HorizontalToolbarTitle className="text-base font-bold tracking-tight">
              {title}
            </HorizontalToolbarTitle>
            {subtitle && (
              <>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <span className="text-xs font-medium text-muted-foreground/80">{subtitle}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
      </div>
    </HorizontalToolbar>
  );
}
