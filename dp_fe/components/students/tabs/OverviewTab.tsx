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
  Award,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  School,
  UserCheck,
  Globe,
  LayoutDashboard
} from "lucide-react";
import type { Student360 } from "@/types/models";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OverviewProps {
  data: Student360;
}

export function OverviewTab({ data }: OverviewProps) {
  const { 
    student, 
    attendance = [], 
    examMarks = [], 
    houseHistory = [], 
    competitionWins = [], 
    clubs = [], 
    events = [], 
    prefectHistory = [], 
    higherTeams = [] 
  } = data;

  const stats = useMemo(() => {
    // Attendance Stats
    const totalAttendance = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    // Exam Stats
    const totalExams = examMarks.length;
    const avgMark = totalExams > 0 
      ? Math.round(examMarks.reduce((acc, curr) => acc + (curr.mark || 0), 0) / totalExams) 
      : 0;

    return {
      attendanceRate,
      avgMark,
      totalCompetitions: competitionWins.length,
      activityCount: clubs.length + events.length,
      isPrefect: prefectHistory.length > 0
    };
  }, [attendance, examMarks, competitionWins, clubs, events, prefectHistory]);

  const currentHouse = houseHistory?.[0]?.houseId;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* 1. Core Profile Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallStatCard 
          label="Attendance Rate" 
          value={`${stats.attendanceRate}%`} 
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
          variant="emerald"
        />
        <SmallStatCard 
          label="Academic Mean" 
          value={`${stats.avgMark}/100`} 
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          variant="orange"
        />
        <SmallStatCard 
          label="Competition Wins" 
          value={stats.totalCompetitions.toString()} 
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
          variant="amber"
        />
        <SmallStatCard 
          label="Participation" 
          value={stats.activityCount.toString()} 
          icon={<Zap className="h-4 w-4 text-indigo-500" />}
          variant="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Institutional Metadata & Roles */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-none ring-1 ring-slate-100 overflow-hidden bg-white rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Institutional Metadata & Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* House Assignment */}
                <div className={cn(
                  "p-5 rounded-xl border flex items-center gap-4",
                  (currentHouse as any)?.color === 'Red' ? "bg-red-50/20 border-red-100" :
                  (currentHouse as any)?.color === 'Blue' ? "bg-blue-50/20 border-blue-100" :
                  (currentHouse as any)?.color === 'Green' ? "bg-emerald-50/20 border-emerald-100" :
                  (currentHouse as any)?.color === 'Yellow' ? "bg-amber-50/20 border-amber-100" : "bg-slate-50 border-slate-100"
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shadow-sm border",
                    (currentHouse as any)?.color === 'Red' ? "bg-white text-red-600 border-red-100" :
                    (currentHouse as any)?.color === 'Blue' ? "bg-white text-blue-600 border-blue-100" :
                    (currentHouse as any)?.color === 'Green' ? "bg-white text-emerald-600 border-emerald-100" :
                    (currentHouse as any)?.color === 'Yellow' ? "bg-white text-amber-600 border-amber-200" : "bg-white text-slate-600 border-slate-100"
                  )}>
                    <School className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">House Cluster</p>
                    <p className="text-sm font-black text-slate-900 leading-none">{(currentHouse as any)?.nameEn || "General"}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">{(currentHouse as any)?.nameSi || "නිවාසයක් නොමැත"}</p>
                  </div>
                </div>

                {/* Prefect Rank */}
                {stats.isPrefect && (
                  <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/20 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Leadership Role</p>
                      <p className="text-sm font-black text-indigo-900 leading-none uppercase">{prefectHistory?.[0]?.myEntry?.rank || "Prefect"}</p>
                      <p className="text-[10px] font-bold text-indigo-500 mt-1">Active for Year {prefectHistory[0].year}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Clubs List */}
              <div className="mt-8 space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Club Memberships</h4>
                <div className="flex flex-wrap gap-2">
                  {clubs.map((club, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white border-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-600 text-[10px] shadow-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      {club.nameEn}
                    </Badge>
                  ))}
                  {clubs.length === 0 && <p className="text-[11px] text-slate-400 italic px-1">No registered memberships found.</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-blue-500" /> Interaction Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100" />
                <div className="space-y-6">
                  {events.slice(0, 3).map((ev, idx) => (
                    <div key={`ev-${idx}`} className="relative flex items-start gap-5">
                      <div className="mt-1 h-8 w-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center z-10 shadow-sm shrink-0">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase">{format(new Date(ev.registeredAt || new Date()), 'MMM d, yyyy')}</p>
                        <h5 className="text-[13px] font-black text-slate-800 leading-tight">Registered for {ev.eventId?.nameEn}</h5>
                      </div>
                    </div>
                  ))}
                  {examMarks.slice(0, 2).map((ex, idx) => (
                    <div key={`ex-${idx}`} className="relative flex items-start gap-5">
                      <div className="mt-1 h-8 w-8 rounded-lg bg-white border border-indigo-100 flex items-center justify-center z-10 shadow-sm shrink-0">
                        <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{ex.examId.year} Audit</p>
                        <h5 className="text-[13px] font-black text-slate-800 leading-tight">Exam Component: {ex.examId.nameEn}</h5>
                        <p className="text-[10px] font-bold text-slate-400">Official Score: {ex.mark}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Performance & Hall of Glory */}
        <div className="space-y-6">
          <Card className="border-none shadow-none ring-1 ring-amber-100 bg-amber-50/10 overflow-hidden rounded-xl">
            <CardHeader className="bg-amber-100/30 border-b border-amber-100 py-3 px-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 flex items-center gap-2">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Competitive Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {competitionWins.length > 0 ? (
                competitionWins.slice(0, 5).map((win, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-50 shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-slate-800 leading-tight truncate">{win.competitionId?.nameEn}</p>
                      <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-black h-3 px-1 uppercase mt-1">PLACE {win.place}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center border border-dashed border-amber-200 rounded-xl">
                  <Trophy className="h-8 w-8 mx-auto opacity-10 mb-2" />
                  <p className="text-[10px] font-black uppercase text-slate-300">No major wins identified</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-slate-400" /> Mastery Benchmarking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
               {data.talents?.slice(0, 4).map((talent, idx) => (
                 <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center px-0.5">
                       <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{talent.areaEn}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{talent.level}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div 
                         className={cn(
                           "h-full rounded-full transition-all duration-1000",
                           talent.level === 'national' || talent.level === 'international' ? "bg-primary w-full" : 
                           talent.level === 'provincial' || talent.level === 'district' ? "bg-primary/70 w-[75%]" : "bg-primary/40 w-[45%]"
                         )}
                       />
                    </div>
                 </div>
               ))}
               {(!data.talents || data.talents.length === 0) && (
                  <p className="text-center text-[10px] text-slate-300 font-bold uppercase py-10 italic">No talent data portfolioed</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SmallStatCard({ label, value, icon, variant }: any) {
  const bgStyles: any = {
    emerald: "bg-emerald-50/30",
    orange: "bg-orange-50/30",
    amber: "bg-amber-50/30",
    indigo: "bg-indigo-50/30"
  };

  return (
    <Card className={cn("border-none shadow-none ring-1 ring-slate-100 bg-white hover:shadow-md transition-all rounded-xl", bgStyles[variant])}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-slate-900 leading-none mt-1">{value}</p>
        </div>
        <div className="h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-50 flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
