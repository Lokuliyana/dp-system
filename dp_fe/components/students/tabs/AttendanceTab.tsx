"use client";

import { useMemo } from "react";
import type { Student360 } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { 
  CheckCircle2, 
  XCircle,
  Activity,
  Calendar,
  Monitor,
  ArrowUpRight,
  ListFilter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AttendanceTabProps {
  data: Student360;
}

export function AttendanceTab({ data }: AttendanceTabProps) {
  const attendanceRecords = data.attendance || [];

  const statistics = useMemo(() => {
    const total = attendanceRecords.length;
    // Map any non-present status to absent for the simplified view if needed, 
    // but the user only wants Present/Absent.
    const present = attendanceRecords.filter((r) => r.status === "present").length;
    const absent = attendanceRecords.filter((r) => r.status === "absent").length;

    const attendancePercentage = total > 0 ? Math.round((present / (present + absent)) * 100) : 0;
    
    return {
      total,
      present,
      absent,
      attendancePercentage,
    };
  }, [attendanceRecords]);

  // Sort records by date descending
  const sortedRecords = useMemo(() => {
     return [...attendanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceRecords]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Core Lifecycle Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompactMetricCard 
          label="Attendance Rate" 
          value={`${statistics.attendancePercentage}%`} 
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
          variant="emerald"
        />
        <CompactMetricCard 
          label="Present Sessions" 
          value={statistics.present.toString()} 
          icon={<CheckCircle2 className="h-4 w-4 text-blue-500" />}
          variant="blue"
        />
        <CompactMetricCard 
          label="Absent Sessions" 
          value={statistics.absent.toString()} 
          icon={<XCircle className="h-4 w-4 text-red-500" />}
          variant="red"
        />
      </div>

      {/* 2. High-Density Attendance Ledger */}
      <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" /> High-Density Attendance Log
          </CardTitle>
          <div className="flex items-center gap-3">
             <Badge className="bg-white border-slate-200 text-slate-400 font-bold h-5 px-2 text-[8px] uppercase tracking-widest">
               {attendanceRecords.length} Records Detected
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-slate-100 border-b border-slate-100">
              {sortedRecords.length > 0 ? (
                sortedRecords.map((record, idx) => (
                  <div key={idx} className="bg-white p-3 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center border text-[10px] font-black",
                        record.status === 'present' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                      )}>
                        {record.status === 'present' ? 'P' : 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 leading-none truncate">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-tighter">{format(new Date(record.date), 'EEEE')}</p>
                      </div>
                    </div>
                    {/* Status indicator on the right */}
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      record.status === 'present' ? "bg-emerald-500" : "bg-red-500"
                    )} />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white">
                  <Calendar className="h-8 w-8 mx-auto text-slate-100 mb-2" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Attendance Data Portfolioed</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompactMetricCard({ label, value, icon, variant }: any) {
  const styles: any = {
    emerald: "bg-emerald-50/20 ring-emerald-100 border-emerald-100",
    blue: "bg-blue-50/20 ring-blue-100 border-blue-100",
    red: "bg-red-50/20 ring-red-100 border-red-100"
  };

  return (
    <div className={cn("p-4 rounded-xl border flex items-center justify-between bg-white shadow-sm ring-1 ring-slate-100", styles[variant])}>
       <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
       </div>
       <div className="h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-50 flex items-center justify-center">
          {icon}
       </div>
    </div>
  );
}
