"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

interface ComparisonData {
  period: string
  studentAverage: number
  classAverage: number
  gradeAverage: number
}

interface ComparativeAnalysisProps {
  data: ComparisonData[]
  title: string
  subtitle?: string
}

export function ComparativeAnalysis({ data, title, subtitle }: ComparativeAnalysisProps) {
  const latestPeriod = data[data.length - 1]
  const previousPeriod = data[data.length - 2]

  const studentTrend = previousPeriod && latestPeriod ? latestPeriod.studentAverage - previousPeriod.studentAverage : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestPeriod && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-600 mb-1">Student Avg</p>
              <p className="text-2xl font-bold text-blue-600">{latestPeriod.studentAverage.toFixed(1)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {studentTrend >= 0 ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{studentTrend.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">{studentTrend.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-slate-600 mb-1">Class Avg</p>
              <p className="text-2xl font-bold text-green-600">{latestPeriod.classAverage.toFixed(1)}</p>
              <p className="text-xs text-slate-600 mt-1">
                {latestPeriod.studentAverage > latestPeriod.classAverage ? "Above" : "Below"} class avg
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-slate-600 mb-1">Grade Avg</p>
              <p className="text-2xl font-bold text-purple-600">{latestPeriod.gradeAverage.toFixed(1)}</p>
              <p className="text-xs text-slate-600 mt-1">
                {latestPeriod.studentAverage > latestPeriod.gradeAverage ? "Above" : "Below"} grade avg
              </p>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => value.toFixed(1)} />
            <Legend />
            <Line type="monotone" dataKey="studentAverage" stroke="#3b82f6" name="Student Average" />
            <Line type="monotone" dataKey="classAverage" stroke="#10b981" name="Class Average" />
            <Line type="monotone" dataKey="gradeAverage" stroke="#8b5cf6" name="Grade Average" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
