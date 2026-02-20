"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Trophy, 
  Activity, 
  Calendar, 
  Star, 
  Shield, 
  Clock, 
  Flame,
  Award
} from "lucide-react";
import type { Student360 } from "@/types/models";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OverviewProps {
  data: Student360;
}

export function OverviewTab({ data }: OverviewProps) {
  const { student, attendance, examMarks, houseHistory, competitionWins, clubs, events, prefectHistory, higherTeams, competitions } = data;

  const stats = useMemo(() => {
    // Attendance Stats
    const totalAttendance = (attendance || []).length;
    const presentDays = (attendance || []).filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    // Exam Stats
    const totalExams = (examMarks || []).length;
    const avgMark = totalExams > 0 
      ? Math.round((examMarks || []).reduce((acc, curr) => acc + (curr.mark || 0), 0) / totalExams) 
      : 0;

    return {
      attendanceRate,
      avgMark,
      totalCompetitions: (competitionWins || []).length,
      houseCount: (houseHistory || []).length,
      clubCount: (clubs || []).length,
      eventCount: (events || []).length,
      isPrefect: (prefectHistory || []).length > 0
    };
  }, [attendance, examMarks, competitionWins, houseHistory, clubs, events, prefectHistory]);

  const currentHouse = houseHistory?.[0]?.houseId;

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Attendance Rate" 
          value={`${stats.attendanceRate}%`} 
          description="Last 30 days reliability"
          icon={<Activity className="h-5 w-5 text-emerald-500" />}
          trend={stats.attendanceRate >= 90 ? "Excellent" : stats.attendanceRate >= 75 ? "Stable" : "Needs Review"}
          trendColor={stats.attendanceRate >= 90 ? "text-emerald-600" : stats.attendanceRate >= 75 ? "text-amber-600" : "text-red-600"}
          variant="emerald"
        />
        <StatCard 
          label="Academic Average" 
          value={`${stats.avgMark}/100`} 
          description="Mean score across all exams"
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          trend={stats.avgMark >= 75 ? "Distinction" : stats.avgMark >= 50 ? "Credit" : "Pass"}
          trendColor={stats.avgMark >= 75 ? "text-orange-600" : stats.avgMark >= 50 ? "text-blue-600" : "text-slate-500"}
          variant="orange"
        />
        <StatCard 
          label="Achievements" 
          value={stats.totalCompetitions.toString()} 
          description="First place victories"
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          trend="Champions League"
          trendColor="text-amber-600"
          variant="amber"
        />
        <StatCard 
          label="Involvement" 
          value={(stats.clubCount + stats.eventCount).toString()} 
          description="Clubs and active events"
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          trend={`${stats.clubCount} Clubs | ${stats.eventCount} Events`}
          trendColor="text-indigo-600"
          variant="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Main Identity & Roles */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Active Assignments & Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* House Assignment */}
                <div className={cn(
                  "p-4 rounded-2xl border flex items-center gap-4",
                  (currentHouse as any)?.color === 'Red' ? "bg-red-50/50 border-red-100" :
                  (currentHouse as any)?.color === 'Blue' ? "bg-blue-50/50 border-blue-100" :
                  (currentHouse as any)?.color === 'Green' ? "bg-emerald-50/50 border-emerald-100" :
                  (currentHouse as any)?.color === 'Yellow' ? "bg-amber-50/50 border-amber-100" : "bg-slate-50/50 border-slate-100"
                )}>
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-sm border",
                    (currentHouse as any)?.color === 'Red' ? "bg-white text-red-600 border-red-100" :
                    (currentHouse as any)?.color === 'Blue' ? "bg-white text-blue-600 border-blue-100" :
                    (currentHouse as any)?.color === 'Green' ? "bg-white text-emerald-600 border-emerald-100" :
                    (currentHouse as any)?.color === 'Yellow' ? "bg-white text-amber-600 border-amber-100" : "bg-white text-slate-600 border-slate-100"
                  )}>
                    🏠
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned House</p>
                    <p className="font-black text-slate-900 leading-none">{(currentHouse as any)?.nameEn || "Unassigned"}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">{(currentHouse as any)?.nameSi || "නිවාසයක් නොමැත"}</p>
                  </div>
                </div>

                {/* Prefect Rank */}
                {stats.isPrefect && (
                  <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100">
                      👑
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Student Council</p>
                      <p className="font-black text-indigo-900 leading-none capitalize">{prefectHistory?.[0]?.myEntry?.rank || "Prefect"}</p>
                      <p className="text-[10px] font-medium text-indigo-500 mt-1">Appointed {prefectHistory?.[0]?.appointedDate ? format(new Date(prefectHistory[0].appointedDate), 'MMM yyyy') : 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Higher Level Representation Snippet */}
                {higherTeams.length > 0 && (
                  <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-100">
                      🌍
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-1">External Recognition</p>
                      <p className="font-black text-amber-900 leading-none capitalize">{higherTeams[0].level} Level</p>
                      <p className="text-[10px] font-medium text-amber-500 mt-1">{higherTeams[0].entries.length} Competition(s)</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Club Memberships</h4>
                <div className="flex flex-wrap gap-2">
                  {(clubs || []).map(club => (
                    <Badge key={club.id || (club as any)._id} variant="outline" className="bg-white border-slate-200 px-3 py-1 gap-2 h-8 font-semibold text-slate-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {club.nameEn}
                    </Badge>
                  ))}
                  {(clubs || []).length === 0 && <p className="text-sm text-slate-400 italic">No active clubs</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-none shadow-sm ring-1 ring-slate-100">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Recent Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative p-6">
                <div className="absolute left-[31px] top-6 bottom-6 w-px bg-slate-100" />
                <div className="space-y-8">
                  {(events || []).slice(0, 3).map((ev, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 pl-1.5">
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-sm shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(new Date(ev.registeredAt || ev.createdAt || new Date()), 'MMM d, yyyy')}</p>
                        <h5 className="text-sm font-bold text-slate-900">Registered for {ev.eventId.nameEn}</h5>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-md">Participation in school events building leadership and teamwork skills.</p>
                      </div>
                    </div>
                  ))}
                  {(examMarks || []).slice(0, 2).map((ex, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 pl-1.5">
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm shrink-0">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ex.examId.date ? format(new Date(ex.examId.date), 'MMM d, yyyy') : 'N/A'}</p>
                        <h5 className="text-sm font-bold text-slate-900">Exam: {ex.examId.nameEn}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700 border-none px-2 py-0 h-5 text-[10px] font-black">
                            {ex.mark}/100
                          </Badge>
                          <span className="text-xs text-slate-500">Academic Evaluation</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Achievements Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-amber-100 bg-amber-50/20 overflow-hidden">
            <CardHeader className="bg-amber-100/30 border-b border-amber-100 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" /> Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {(competitionWins || []).map((win, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                      <Star className="h-5 w-5 fill-amber-500 stroke-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{win.competitionId.nameEn}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-amber-600 text-white border-none text-[9px] h-4 px-1.5 font-bold uppercase">
                          {win.place === 1 ? 'Winner' : `${win.place}th Place`}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400">{win.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(competitionWins || []).length === 0 && (
                  <div className="py-8 text-center text-slate-400 border-2 border-dashed border-amber-100/50 rounded-2xl">
                    <Star className="h-8 w-8 mx-auto opacity-20 mb-2" />
                    <p className="text-xs font-medium">No major wins recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Talent Portfolio Summary */}
          <Card className="border-none shadow-sm ring-1 ring-slate-100">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" /> Talent Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {(data.talents || []).map((talent, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{talent.areaEn}</span>
                      <span className="font-medium text-slate-400 capitalize">{talent.level}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          talent.starLevel === 2 ? "bg-primary w-full" : "bg-primary/60 w-2/3"
                        )} 
                      />
                    </div>
                  </div>
                ))}
                {(data.talents || []).length === 0 && <p className="text-center text-xs text-slate-400 py-4">No specific talents portfolioed</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  description, 
  icon, 
  trend, 
  trendColor, 
  variant 
}: { 
  label: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode; 
  trend: string;
  trendColor: string;
  variant: 'emerald' | 'orange' | 'amber' | 'indigo';
}) {
  const bgColors = {
    emerald: "bg-emerald-50 ring-emerald-100",
    orange: "bg-orange-50 ring-orange-100",
    amber: "bg-amber-50 ring-amber-100",
    indigo: "bg-indigo-50 ring-indigo-100"
  };

  return (
    <Card className={cn("border-none shadow-none ring-1", bgColors[variant])}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-8 w-8 rounded-lg bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center">
            {icon}
          </div>
          <span className={cn("text-[10px] font-black uppercase tracking-tighter", trendColor)}>
            {trend}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
          </div>
          <p className="text-[9px] font-medium text-slate-500 leading-none">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
