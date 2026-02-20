"use client";

import React, { useEffect } from "react";
import { HorizontalToolbar, HorizontalToolbarTitle } from "./blocks";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useInnerLayoutControls } from "./context";
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

  useEffect(() => {
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);

  const renderActions = () => {
    if (!actions) return null;
    if (!Array.isArray(actions)) return actions;

    return (
      <div className="flex items-center gap-3">
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
    <HorizontalToolbar className={cn("h-12 px-6", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
            <Icon className="h-4 w-4" />
          </div>
        )}
        
        <div className="flex flex-col border-r border-slate-100 pr-3 mr-1">
          <div className="flex items-center gap-2">
            <HorizontalToolbarTitle className="text-sm font-bold tracking-tight text-slate-800">
              {title}
            </HorizontalToolbarTitle>
            {subtitle && (
              <>
                <Separator orientation="vertical" className="h-3 mx-1 bg-slate-200" />
                <span className="text-[10px] font-medium text-slate-500">{subtitle}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {renderActions()}
      </div>
    </HorizontalToolbar>
  );
}

