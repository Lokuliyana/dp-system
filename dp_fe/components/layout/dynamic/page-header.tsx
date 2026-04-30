"use client";

import React, { useEffect } from "react";
import { HorizontalToolbar, HorizontalToolbarTitle } from "./blocks";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useInnerLayoutControls } from "./context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  HeaderAction,
  HeaderButton,
  HeaderSelect,
  HeaderDatePicker,
  HeaderSearch
} from "./header-actions";

interface DynamicPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode | HeaderAction[];
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
  const isMobile = useIsMobile();

  useEffect(() => {
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);

  const renderActions = () => {
    if (!actions) return null;
    if (!Array.isArray(actions)) return actions;

    return (
      <div className="flex items-center gap-2">
        {actions.map((action, idx) => {
          if (action.type === "button") return <HeaderButton key={idx} {...action.props} />;
          if (action.type === "select") return <HeaderSelect key={idx} {...action.props} />;
          if (action.type === "date") return <HeaderDatePicker key={idx} {...action.props} />;
          if (action.type === "search") return <HeaderSearch key={idx} {...action.props} />;
          if (action.type === "custom") return <React.Fragment key={idx}>{action.render}</React.Fragment>;
          return null;
        })}
      </div>
    );
  };

  return (
    <HorizontalToolbar className={cn(isMobile ? "px-4 py-2" : "h-12 px-6", className)}>
      {/* Title section — hidden on mobile (shown in module nav bar instead) */}
      {!isMobile && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {Icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-1">
            <HorizontalToolbarTitle className="text-sm font-bold tracking-tight text-slate-800">
              {title}
            </HorizontalToolbarTitle>
            {subtitle && (
              <>
                <Separator orientation="vertical" className="h-3 mx-0.5 bg-slate-200" />
                <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{subtitle}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions — shown on both mobile and desktop */}
      <div className={cn(
        "flex items-center gap-2",
        isMobile && "flex-wrap"
      )}>
        {renderActions()}
      </div>
    </HorizontalToolbar>
  );
}
