"use client";

import React from "react";
import { HorizontalToolbar, HorizontalToolbarTitle } from "./blocks";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  return (
    <HorizontalToolbar className={cn("h-14", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <HorizontalToolbarTitle className="text-base font-semibold tracking-tight">
              {title}
            </HorizontalToolbarTitle>
            {subtitle && (
              <>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <span className="text-sm text-muted-foreground">{subtitle}</span>
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
