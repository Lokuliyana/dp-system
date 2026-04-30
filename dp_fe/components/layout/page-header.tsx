"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b border-slate-200 bg-white sticky top-0 z-20", className)}>
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 leading-tight truncate">{title}</h1>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
        )}
      </div>
    </div>
  )
}
