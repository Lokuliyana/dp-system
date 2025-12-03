"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { AlertCircle, TrendingDown, Target } from "lucide-react"
import { Badge } from "@/components/ui"

interface PredictiveAlert {
  id: string
  studentName: string
  riskLevel: "critical" | "high" | "medium"
  reason: string
  suggestedAction: string
  timestamp: string
}

interface PredictiveAlertsProps {
  alerts: PredictiveAlert[]
}

const riskColors = {
  critical: "bg-red-50 border-red-200",
  high: "bg-orange-50 border-orange-200",
  medium: "bg-yellow-50 border-yellow-200",
}

const riskBadgeColors = {
  critical: "bg-red-600",
  high: "bg-orange-600",
  medium: "bg-yellow-600",
}

export function PredictiveAlerts({ alerts }: PredictiveAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-600" />
            Predictive Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p className="mb-2">✓ No at-risk students detected</p>
            <p className="text-sm">All students are performing as expected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Predictive Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-lg border ${riskColors[alert.riskLevel]}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <TrendingDown className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900">{alert.studentName}</p>
                  <Badge className={riskBadgeColors[alert.riskLevel]}>
                    {alert.riskLevel.charAt(0).toUpperCase() + alert.riskLevel.slice(1)} Risk
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{alert.reason}</p>
                <div className="flex items-center gap-2 p-2 bg-white/50 rounded">
                  <Target className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-600">{alert.suggestedAction}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
