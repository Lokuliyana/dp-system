"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children?: ReactNode;
  variant?: "page" | "section" | "subsection";
  className?: string;
}

export function Header({
  title,
  description,
  icon: Icon,
  actions,
  children,
  variant = "page",
  className,
}: HeaderProps) {
  const isPage = variant === "page";
  const isSection = variant === "section";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isPage && "border-b border-slate-200 bg-white px-4 py-3 sticky top-0 z-10",
        !isPage && "px-0 py-0",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div
              className={cn(
                "flex items-center justify-center rounded-md border",
                isPage ? "h-10 w-10 bg-slate-50 border-slate-200 text-slate-700" : "h-8 w-8 bg-transparent border-transparent text-slate-500"
              )}
            >
              <Icon className={cn("shrink-0", isPage ? "h-5 w-5" : "h-4 w-4")} />
            </div>
          )}
          <div className="space-y-1">
            <h1
              className={cn(
                "font-semibold tracking-tight text-slate-900",
                isPage ? "text-2xl" : isSection ? "text-lg" : "text-base"
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-500 max-w-2xl text-balance">
                {description}
              </p>
            )}
          </div>
        </div>

        {(actions || children) && (
          <div className="flex items-center gap-2">
            {actions}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
