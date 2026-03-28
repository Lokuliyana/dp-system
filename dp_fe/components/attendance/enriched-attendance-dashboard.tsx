"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { 
  CalendarCheck, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Phone,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AttendanceDatePicker } from "./attendance-date-picker"
import { AttendanceDateDisplay } from "./attendance-date-display"
import { useAttendanceDashboard } from "@/hooks/useAttendance"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function EnrichedAttendanceDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : ""
  const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : startDate

  const { data, isLoading } = useAttendanceDashboard(startDate, endDate)

  const summary = data?.summary || { totalRecords: 0, avgRate: 0 }
  const dailyTrend = data?.dailyTrend || []
  const gradeStats = data?.gradeStats || []
  const interventionList = data?.interventionList || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Attendance Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into student presence and participation.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 p-1 bg-slate-100 rounded-2xl">
          <AttendanceDatePicker date={date} setDate={setDate} />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Overall Rate" 
          value={`${Math.round(summary.avgRate)}%`}
          description="Average for period"
          icon={CalendarCheck}
          trend={summary.avgRate > 85 ? "up" : "down"}
          color="blue"
        />
        <StatsCard 
          title="Records Found" 
          value={summary.totalRecords.toLocaleString()}
          description="Total attendance entries"
          icon={Users}
          color="purple"
        />
        <StatsCard 
          title="Alerts" 
          value={interventionList.length}
          description="High absence students"
          icon={AlertCircle}
          trend={interventionList.length > 5 ? "up" : "down"}
          trendReversed
          color="red"
        />
        <StatsCard 
          title="Target" 
          value="95%"
          description="School goal"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Trend Chart */}
        <Card className="lg:col-span-4 border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Attendance Trend
            </CardTitle>
            <CardDescription>Daily presence percentage over the selected range</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => format(new Date(val), "MMM dd")}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => format(new Date(val), "EEEE, MMMM dd")}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Breakdown Chart */}
        <Card className="lg:col-span-3 border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Grade-wise Performance</CardTitle>
            <CardDescription>Average rates compared across grades</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="gradeName" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="rate" radius={[0, 10, 10, 0]} barSize={20}>
                  {gradeStats.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rate > 90 ? '#10b981' : entry.rate > 75 ? '#3b82f6' : '#f59e0b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lists Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Intervention List */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Intervention Needed
              </CardTitle>
              <CardDescription>Students with frequent absences in this period</CardDescription>
            </div>
            <Badge variant="destructive" className="rounded-full">
              {interventionList.length} Students
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {interventionList.map((item: any) => (
                <div key={item.studentId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      {item.absentCount}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.gradeName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.phone && (
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200" asChild>
                         <a href={`tel:${item.phone}`}><Phone className="h-3.5 w-3.5 text-slate-600" /></a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-tight text-blue-600 h-8 px-3 rounded-full hover:bg-blue-50">
                      Profile
                    </Button>
                  </div>
                </div>
              ))}
              {interventionList.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                   <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm font-medium">No students currently require intervention.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grade Comparison List */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Grade Performance
            </CardTitle>
            <CardDescription>Live leaderboard by attendance rate</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {[...gradeStats].sort((a,b) => b.rate - a.rate).map((grade, idx) => (
                  <div key={grade.gradeId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                          idx === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                        )}>
                           {idx + 1}
                        </div>
                        <span className="font-bold text-sm">{grade.gradeName}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="text-right">
                           <p className="text-sm font-black">{Math.round(grade.rate)}%</p>
                           <p className="text-[10px] text-muted-foreground">Attendance</p>
                        </div>
                        <div className={cn(
                          "w-1.5 h-8 rounded-full",
                          grade.rate > 90 ? "bg-emerald-500" : grade.rate > 75 ? "bg-blue-500" : "bg-amber-500"
                        )} />
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function StatsCard({ title, value, description, icon: Icon, trend, trendReversed, color }: any) {
  const colorMap: any = {
    blue: "from-blue-500 to-indigo-600 shadow-blue-100",
    purple: "from-purple-500 to-fuchsia-600 shadow-purple-100",
    red: "from-rose-500 to-red-600 shadow-rose-100",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-100",
  }

  return (
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg",
            colorMap[color]
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
              (trend === 'up' && !trendReversed) || (trend === 'down' && trendReversed) 
                ? "bg-emerald-100 text-emerald-600" 
                : "bg-rose-100 text-rose-600"
            )}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-black tracking-tight text-slate-900">{value}</div>
          <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wide">{title}</div>
          <p className="text-xs text-slate-500 mt-2 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
