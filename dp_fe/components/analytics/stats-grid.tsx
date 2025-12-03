"use client"

import { Card, CardContent } from "@/components/ui"
import type React from "react"

interface Stat {
  id: string
  label: string
  value: string | number
  subValue?: string
  icon?: React.ReactNode
  color?: "blue" | "green" | "red" | "yellow" | "purple"
  onClick?: () => void
}

interface StatsGridProps {
  stats: Stat[]
  columns?: number
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-700",
  purple: "bg-purple-50 text-purple-700",
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {stats.map((stat) => (
        <Card
          key={stat.id}
          className={`cursor-pointer hover:shadow-lg transition-all ${stat.onClick ? "" : ""}`}
          onClick={stat.onClick}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.subValue && <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>}
              </div>
              {stat.icon && <div className={`p-3 rounded-lg ${colorClasses[stat.color || "blue"]}`}>{stat.icon}</div>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
