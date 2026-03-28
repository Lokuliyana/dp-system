"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Trophy,
  Award,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Header,
} from "@/components/ui";
import { usePermission } from "@/hooks/usePermission";
import { useDashboard } from "@/hooks/useDashboard";
import { useHouses } from "@/hooks/useHouses";

// Motion presets
const sectionFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const listContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

export function ImprovedDashboard() {
  const { can } = usePermission();
  const { data: dashboard, isLoading: isDashboardLoading } = useDashboard();
  const { data: houses, isLoading: isHousesLoading } = useHouses();
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");

  // All hooks must be at the top level
  const gradePerfData = useMemo(() => {
    const allGrades = (Array.isArray(dashboard?.gradePerformance) ? dashboard.gradePerformance : []);
    const filtered = selectedSectionId === "all" 
      ? allGrades 
      : allGrades.filter(g => g.sectionId === selectedSectionId);

    return filtered.map((g: any) => ({
      grade: g.gradeNameSi || g.gradeNameEn,
      marks: Math.round(g.avgMark || 0),
      attendance: Math.round(g.avgAttendance || 0),
    }));
  }, [dashboard, selectedSectionId]);

  if (isDashboardLoading || isHousesLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard records...</div>;
  }

  const attendanceAvg = Math.round(dashboard?.attendanceAvg || 0);

  const stats = [
    {
      title: "Total Students",
      value: String(dashboard?.studentCount || 0),
      icon: Users,
      colorClass: "bg-blue-50 text-blue-700 border-blue-200",
      trend: "Active learners",
      permission: "student.student.read",
    },
    {
      title: "Number of Staff",
      value: String(dashboard?.staffCount || 0),
      icon: Award,
      colorClass: "bg-purple-50 text-purple-700 border-purple-200",
      trend: "Total teaching staff",
      permission: "staff.teacher.read",
    },
    {
      title: "Attendance",
      value: `${attendanceAvg}%`,
      icon: TrendingUp,
      colorClass: "bg-green-50 text-green-700 border-green-200",
      trend: "Past 30 days avg",
      permission: "student.attendance.read",
    },
    {
      title: "Competitions",
      value: String(dashboard?.competitionCount || 0),
      icon: Trophy,
      colorClass: "bg-amber-50 text-amber-700 border-amber-200",
      trend: "This academic year",
      permission: "housemeets.competition.read",
    },
  ];

  const houseLeaderboard = (dashboard?.housePoints || []).map((h: any) => ({
    ...h,
    name: houses?.find((house: any) => house.id === h.houseId)?.nameEn || "Unknown House",
  }));

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-10">
      <div className="space-y-8 p-6 lg:p-8">
        {/* Header & Section Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Header
            icon={BarChart3}
            title="Sri Ananda Overview"
            description="Real-time insights across students, staff, and performance."
            variant="page"
          />
          
          <Tabs value={selectedSectionId} onValueChange={setSelectedSectionId} className="w-full md:w-auto">
            <TabsList className="bg-slate-100/50 backdrop-blur-sm border border-slate-200 p-1">
              <TabsTrigger value="all" className="text-xs font-bold uppercase tracking-wider">All Sections</TabsTrigger>
              {dashboard?.sections?.map((sec: any) => (
                <TabsTrigger key={sec.id} value={sec.id} className="text-xs font-bold uppercase tracking-wider">
                  {sec.nameEn}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Overview & Stats */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {stats.filter(s => !s.permission || can(s.permission)).map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.title} variants={listItem}>
                    <Card className="h-full border-none shadow-md bg-white/40 backdrop-blur-md hover:shadow-lg transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                              {stat.title}
                            </p>
                            <p className="mt-2 text-3xl font-black text-slate-800 tracking-tighter">
                              {stat.value}
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-slate-500">
                              {stat.trend}
                            </p>
                          </div>
                          <div className={`${stat.colorClass} border-none shadow-sm flex h-12 w-12 items-center justify-center rounded-2xl`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Performance Chart */}
            <motion.div variants={sectionFade} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Header
                title="Class Performance Trends"
                description="Cross-analysis of average marks and attendance percentages."
                variant="section"
              />
              <Card className="border-none shadow-xl bg-white/60 backdrop-blur-lg mt-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-600">Marks vs. Attendance</CardTitle>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-indigo-500" /> Avg Marks</div>
                      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Attendance %</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradePerfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="grade"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 13, fill: "#334155", fontWeight: 700 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          cursor={{ fill: "#f1f5f9", radius: 8 }}
                          contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                        />
                        <Bar dataKey="marks" fill="#6366f1" name="Avg Mark" radius={[6, 6, 0, 0]} barSize={24} />
                        <Bar dataKey="attendance" fill="#10b981" name="Avg Attendance" radius={[6, 6, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right: Calendar & Events (Top Corner) */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              variants={sectionFade}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <Header
                title="Schedule"
                description="Upcoming events & holidays."
                variant="section"
              />
              <Card className="border-none shadow-lg bg-white overflow-hidden rounded-3xl">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" /> Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto p-4 space-y-6">
                    {/* Special Days */}
                    {(dashboard?.specialDays?.length || 0) > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Holidays</p>
                        {dashboard?.specialDays?.map((day: any) => (
                          <div key={day._id} className="flex items-center gap-3 p-2 rounded-xl bg-orange-50 border border-orange-100/50">
                            <div className="flex flex-col items-center justify-center min-w-[40px] h-10 rounded-lg bg-white shadow-sm font-bold">
                              <span className="text-[9px] text-orange-400 leading-none">
                                {new Date(day.date).toLocaleString('default', { month: 'short' })}
                              </span>
                              <span className="text-sm text-orange-600">
                                {new Date(day.date).getDate()}
                              </span>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-700 truncate">{day.label}</p>
                              <p className="text-[9px] text-orange-500 font-medium">{day.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Events */}
                    <div className="space-y-3 pt-2">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Events</p>
                       <div className="space-y-4">
                        {dashboard?.upcomingEvents?.map((event: any) => (
                          <div key={event._id} className="relative pl-4 border-l-2 border-slate-100 group">
                            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                            <p className="text-xs font-bold text-slate-800 leading-tight">{event.nameEn}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                              {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {event.eventType}
                            </p>
                          </div>
                        ))}
                        {(!dashboard?.upcomingEvents || dashboard.upcomingEvents.length === 0) && (
                          <p className="text-xs text-slate-400 italic py-4">No events scheduled.</p>
                        )}
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* House Leaderboard - Refined UI */}
              <div className="pt-4 space-y-4">
                 <Header
                   title="House Standing"
                   variant="section"
                 />
                 <Card className="border-none shadow-md bg-slate-900 text-white rounded-3xl overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      {houseLeaderboard.map((house: any, idx: number) => (
                        <div key={house.houseId} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                idx === 0 ? 'bg-yellow-400 text-slate-900' : 
                                idx === 1 ? 'bg-slate-300 text-slate-800' : 
                                idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'
                             }`}>
                                #{idx + 1}
                             </div>
                             <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{house.name}</span>
                          </div>
                          <span className="text-xs font-black">{house.points}</span>
                        </div>
                      ))}
                    </CardContent>
                 </Card>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Shortcuts Footer */}
        <motion.div variants={sectionFade} className="pt-8 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={Trophy}
              label="Competitions"
              description="Yearly results"
              colorClass="border-none bg-blue-50/50 hover:bg-blue-100/50 text-blue-700"
              iconClass="bg-blue-100"
            />
            <QuickActionButton
              icon={Award}
              label="Staff Directory"
              description="Manage teachers"
              colorClass="border-none bg-purple-50/50 hover:bg-purple-100/50 text-purple-700"
              iconClass="bg-purple-100"
            />
            <QuickActionButton
              icon={Users}
              label="Student List"
              description="Full directory"
              colorClass="border-none bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-700"
              iconClass="bg-emerald-100"
            />
            <QuickActionButton
              icon={Calendar}
              label="Calendar"
              description="Full schedule"
              colorClass="border-none bg-orange-50/50 hover:bg-orange-100/50 text-orange-700"
              iconClass="bg-orange-100"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  colorClass: string;
  iconClass: string;
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  colorClass,
  iconClass,
}: QuickActionButtonProps) {
  return (
    <motion.button
      type="button"
      variants={listItem}
      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all hover:shadow-sm ${colorClass}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 ${iconClass}`} />
        <div>
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 text-xs text-slate-600">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}
