"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ChevronLeft, X } from "lucide-react"

export interface LayoutTab {
  id: string
  label: string
  icon?: React.ReactNode
  component: React.ComponentType<any>
  badge?: string | number
}

export interface LayoutControllerProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  tabs: LayoutTab[]
  defaultTabId?: string
  horizontalToolbar?: React.ReactNode
  verticalToolbarItems?: Array<{
    id: string
    label: string
    icon: React.ReactNode
    action: () => void
    variant?: "default" | "destructive" | "outline" | "ghost"
  }>
  onClose?: () => void
  backButton?: boolean
  onBack?: () => void
  className?: string
  headerBackground?: string
}

export function LayoutController({
  title,
  subtitle,
  icon,
  tabs,
  defaultTabId,
  horizontalToolbar,
  verticalToolbarItems = [],
  onClose,
  backButton = true,
  onBack,
  className = "",
  headerBackground = "bg-gradient-to-r from-slate-50 to-slate-100",
}: LayoutControllerProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id || "")
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const ActiveComponent = activeTab?.component

  return (
    <div className={`flex h-full gap-0 ${className}`}>
      {/* Vertical Toolbar */}
      {verticalToolbarItems.length > 0 && (
        <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-2">
          {verticalToolbarItems.map((item) => (
            <Button
              key={item.id}
              onClick={item.action}
              variant={item.variant || "ghost"}
              size="lg"
              className="w-12 h-12 rounded-lg p-0 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title={item.label}
            >
              {item.icon}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${headerBackground} border-b border-slate-200 px-6 py-5 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            {backButton && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              {icon && <div className="text-slate-700">{icon}</div>}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {horizontalToolbar}
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-slate-600 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-6 py-0 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTabId === tab.id
                  ? "border-b-blue-600 text-blue-600"
                  : "border-b-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && <Badge className="ml-1 bg-blue-100 text-blue-700">{tab.badge}</Badge>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {ActiveComponent ? (
            <div className="p-6">
              <ActiveComponent />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">No content available</div>
          )}
        </div>
      </div>
    </div>
  )
}
