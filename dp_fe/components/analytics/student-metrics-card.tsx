"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import type React from "react"

interface StudentMetricsCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  metrics: {
    label: string
    value: string | number
    variant?: "default" | "secondary" | "destructive" | "outline"
  }[]
  children?: React.ReactNode
}

export function StudentMetricsCard({ title, description, icon, metrics, children }: StudentMetricsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle>{title}</CardTitle>
            </div>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
