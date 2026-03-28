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
  Zap
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
  PolarRadiusAxis
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useCompetitionDashboard } from "@/hooks/useCompetitions"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function EnrichedHouseMeetsDashboard({ year }: { year: number }) {
  const { data, isLoading } = useCompetitionDashboard(year)

  const housePoints = data?.housePoints || []
  const gradePoints = data?.gradePoints || []
  const mvpList = data?.mvpList || []
  const summary = data?.summary || { totalCompetitions: 0, completedCompetitions: 0, completionRate: 0, totalPointsAwarded: 0 }

  // Prepare data for Radar Chart (Points by Grade Level per House)
  const radarData = useMemo(() => {
    const grades = Array.from(new Set(gradePoints.map(gp => gp.gradeName))).sort()
    return grades.map(gn => {
      const entry: any = { subject: gn }
      housePoints.forEach(hp => {
        const pts = gradePoints.find(gp => gp.gradeName === gn && gp.houseName === hp.name)?.points || 0
        entry[hp.name] = pts
      })
      return entry
    })
  }, [gradePoints, housePoints])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
      {/* Header Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Leading House" 
          value={housePoints[0]?.name || "N/A"}
          description={`${housePoints[0]?.points || 0} Total Points`}
          icon={Trophy}
          color="yellow"
        />
        <MetricCard 
          title="Completion" 
          value={`${Math.round(summary.completionRate)}%`}
          description={`${summary.completedCompetitions} of ${summary.totalCompetitions} Events`}
          icon={Zap}
          color="blue"
        />
        <MetricCard 
          title="Total Points" 
          value={summary.totalPointsAwarded.toLocaleString()}
          description="Distributed this year"
          icon={Star}
          color="purple"
        />
        <MetricCard 
          title="Academic Year" 
          value={year.toString()}
          description="Active Session"
          icon={Calendar}
          color="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* House Standings Horizontal Bar */}
        <Card className="lg:col-span-4 border-none shadow-2xl bg-slate-900 text-white rounded-[2rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
              House Leaderboard
            </CardTitle>
            <CardDescription className="text-slate-400">Current overall standings across all competitions</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housePoints} layout="vertical" margin={{ left: 20, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#fff', fontSize: 12, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="points" radius={[0, 20, 20, 0]} barSize={32}>
                  {housePoints.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} shadow="0 4px 6px -1px rgb(0 0 0 / 0.1)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution Radar */}
        <Card className="lg:col-span-3 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Grade Dominance
            </CardTitle>
            <CardDescription>House performance distribution by grade level</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} hide />
                {housePoints.slice(0, 4).map((house: any, idx: number) => (
                   <Radar
                     key={house.houseId}
                     name={house.name}
                     dataKey={house.name}
                     stroke={house.color}
                     fill={house.color}
                     fillOpacity={0.4}
                   />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MVP Spotlight */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[2rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Medal className="h-6 w-6" />
              MVP Spotlight
            </CardTitle>
            <CardDescription className="text-amber-100">Top individuals by total points awarded</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                {mvpList.map((mvp: any, idx: number) => (
                  <div key={mvp.studentId} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                          idx === 0 ? "bg-yellow-400 text-slate-900" : "bg-white/20 text-white"
                        )}>
                           {idx + 1}
                        </div>
                        <div>
                           <p className="font-bold">{mvp.name}</p>
                           <div className="flex items-center gap-2 mt-0.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mvp.houseColor }} />
                              <span className="text-[10px] uppercase font-black opacity-80">{mvp.houseName}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black">{mvp.totalPoints} pts</p>
                        <p className="text-[10px] font-bold opacity-70">{mvp.wins} Wins</p>
                     </div>
                  </div>
                ))}
                {mvpList.length === 0 && (
                   <div className="text-center py-20 opacity-50">No MVP data available yet.</div>
                )}
             </div>
          </CardContent>
        </Card>

        {/* Recent Achievements / Live Standings */}
        <Card className="border-none shadow-xl bg-slate-50 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 font-bold">
               <Award className="h-6 w-6 text-slate-800" />
               Current Standings
            </CardTitle>
            <CardDescription>Detailed point breakdown by House</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {housePoints.map((house: any) => (
                  <div key={house.houseId} className="space-y-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-4 h-4 rounded-full" style={{ backgroundColor: house.color }} />
                           <span className="font-bold text-slate-800">{house.name}</span>
                        </div>
                        <span className="font-black text-lg">{house.points} <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Total</span></span>
                     </div>
                     <Progress 
                        value={(house.points / Math.max(...housePoints.map((h: any) => h.points), 1)) * 100} 
                        className="h-3 rounded-full bg-slate-200" 
                        style={{ '--progress-foreground': house.color } as any}
                     />
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function MetricCard({ title, value, description, icon: Icon, color }: any) {
  const colorMap: any = {
    yellow: "bg-yellow-400 text-slate-900 shadow-yellow-100",
    blue: "bg-blue-600 text-white shadow-blue-100",
    purple: "bg-purple-600 text-white shadow-purple-100",
    emerald: "bg-emerald-600 text-white shadow-emerald-100",
  }

  return (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden hover:scale-105 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-3 rounded-2xl", colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Live</Badge>
        </div>
        <div className="mt-6">
          <div className="text-2xl font-black text-slate-900 tracking-tight truncate">{value}</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
