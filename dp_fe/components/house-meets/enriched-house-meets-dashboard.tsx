"use client"

import { useMemo } from "react"
import {
  Trophy,
  Users,
  Medal,
  Award,
  TrendingUp,
  Calendar,
  Star,
  Target,
  Zap,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useCompetitionDashboard } from "@/hooks/useCompetitions"
import { cn } from "@/lib/utils"

export function EnrichedHouseMeetsDashboard({ year }: { year: number }) {
  const { data, isLoading } = useCompetitionDashboard(year)

  const housePoints = data?.housePoints || []
  const gradePoints = data?.gradePoints || []
  const mvpList = data?.mvpList || []
  const summary = data?.summary || {
    totalCompetitions: 0,
    completedCompetitions: 0,
    completionRate: 0,
    totalPointsAwarded: 0,
  }

  const radarData = useMemo(() => {
    const grades = Array.from(new Set(gradePoints.map((gp) => gp.gradeName))).sort()
    return grades.map((gn) => {
      const entry: any = { subject: gn }
      housePoints.forEach((hp) => {
        const pts =
          gradePoints.find((gp) => gp.gradeName === gn && gp.houseName === hp.name)?.points || 0
        entry[hp.name] = pts
      })
      return entry
    })
  }, [gradePoints, housePoints])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Leading House"
          value={housePoints[0]?.name || "N/A"}
          description={`${housePoints[0]?.points || 0} total points`}
          icon={Trophy}
          accent="yellow"
        />
        <MetricCard
          title="Completion"
          value={`${Math.round(summary.completionRate)}%`}
          description={`${summary.completedCompetitions} of ${summary.totalCompetitions} events`}
          icon={Zap}
          accent="blue"
        />
        <MetricCard
          title="Points Awarded"
          value={summary.totalPointsAwarded.toLocaleString()}
          description="Distributed this year"
          icon={Star}
          accent="purple"
        />
        <MetricCard
          title="Academic Year"
          value={year.toString()}
          description="Active session"
          icon={Calendar}
          accent="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Leaderboard bar chart */}
        <Card className="lg:col-span-4 border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              House Leaderboard
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Overall standings across all competitions
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housePoints} layout="vertical" margin={{ left: 10, right: 32 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={24}>
                  {housePoints.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar chart */}
        <Card className="lg:col-span-3 border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
              <Target className="h-4 w-4 text-slate-400" />
              Grade Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Points distribution by grade level
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, "auto"]} hide />
                {housePoints.slice(0, 4).map((house: any) => (
                  <Radar
                    key={house.houseId}
                    name={house.name}
                    dataKey={house.name}
                    stroke={house.color}
                    fill={house.color}
                    fillOpacity={0.25}
                  />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* MVP list */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
              <Medal className="h-4 w-4 text-slate-400" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Individuals ranked by total points
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {mvpList.map((mvp: any, idx: number) => (
                <div
                  key={mvp.studentId}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        idx === 0
                          ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{mvp.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: mvp.houseColor }}
                        />
                        <span className="text-xs text-slate-500">{mvp.houseName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{mvp.totalPoints} pts</p>
                    <p className="text-xs text-slate-400">{mvp.wins} win{mvp.wins !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
              {mvpList.length === 0 && (
                <div className="text-center py-12 text-sm text-slate-400">
                  No performance data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Standings with progress bars */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
              <Award className="h-4 w-4 text-slate-400" />
              Current Standings
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Point breakdown by house
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {housePoints.map((house: any) => {
              const maxPts = Math.max(...housePoints.map((h: any) => h.points), 1)
              return (
                <div key={house.houseId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: house.color }}
                      />
                      <span className="font-medium text-slate-700">{house.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {house.points}
                    </span>
                  </div>
                  <Progress
                    value={(house.points / maxPts) * 100}
                    className="h-2 rounded-full bg-slate-100"
                    style={{ "--progress-foreground": house.color } as any}
                  />
                </div>
              )
            })}
            {housePoints.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No standings data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: {
  title: string
  value: string
  description: string
  icon: any
  accent: "yellow" | "blue" | "purple" | "green"
}) {
  const accentMap: Record<string, string> = {
    yellow: "text-amber-600 bg-amber-50",
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    green: "text-emerald-600 bg-emerald-50",
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xl font-semibold text-slate-900 truncate">{value}</div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{title}</p>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
