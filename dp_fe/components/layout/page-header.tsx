"use client"

import type React from "react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({ title, description, icon, children }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {icon && <div className="text-slate-400 mt-1">{icon}</div>}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {description && <p className="text-slate-600 mt-0.5 text-xs">{description}</p>}
            </div>
          </div>
          {children && <div className="flex gap-2">{children}</div>}
        </div>
      </div>
    </div>
  )
}
