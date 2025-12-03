"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { AlertCircle, TrendingUp, TrendingDown, Info } from "lucide-react"
import type React from "react"

interface Insight {
  id: string
  type: "warning" | "success" | "info" | "alert"
  title: string
  description: string
  action?: React.ReactNode
}

interface InsightsSectionProps {
  title: string
  description?: string
  insights: Insight[]
}

const iconMap = {
  warning: <TrendingDown className="h-5 w-5 text-yellow-600" />,
  success: <TrendingUp className="h-5 w-5 text-green-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
  alert: <AlertCircle className="h-5 w-5 text-red-600" />,
}

const bgColorMap = {
  warning: "bg-yellow-50 border-yellow-200",
  success: "bg-green-50 border-green-200",
  info: "bg-blue-50 border-blue-200",
  alert: "bg-red-50 border-red-200",
}

export function InsightsSection({ title, description, insights }: InsightsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className={`p-4 rounded-lg border ${bgColorMap[insight.type]}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{iconMap[insight.type]}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                {insight.action && <div className="mt-2">{insight.action}</div>}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
