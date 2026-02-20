"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Calendar, 
  Target,
  Clock,
  ArrowUpRight,
  ClipboardCheck,
  Zap
} from "lucide-react";
import type { Student360 } from "@/types/models";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ExamsTabProps {
  data: Student360;
}

export function ExamsTab({ data }: ExamsTabProps) {
  const examMarks = data.examMarks || [];

  const analytics = useMemo(() => {
    if (examMarks.length === 0) return null;

    const sortedExams = [...examMarks].sort((a, b) => 
      new Date(a.examId.date).getTime() - new Date(b.examId.date).getTime()
    );

    const latest = sortedExams[sortedExams.length - 1];
    const previous = sortedExams.length > 1 ? sortedExams[sortedExams.length - 2] : null;

    const trend = previous ? latest.mark - previous.mark : 0;
    const avgScore = Math.round(examMarks.reduce((acc, curr) => acc + (curr.mark || 0), 0) / examMarks.length);
    
    return {
      latest,
      trend,
      avgScore,
      history: sortedExams.reverse()
    };
  }, [examMarks]);

  if (!analytics) {
    return (
      <div className="py-24 text-center bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100">
        <BarChart3 className="h-10 w-10 mx-auto text-slate-200 mb-4" />
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Academic Records Identified</h4>
        <p className="text-xs text-slate-300 mt-2 italic max-w-xs mx-auto">Verified examination data for this profile is currently unavailable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Concise Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmallMetricCard 
          label="Average score" 
          value={`${analytics.avgScore}%`} 
          icon={<Target className="h-4 w-4 text-indigo-500" />}
          variant="indigo"
        />
        <SmallMetricCard 
          label="Recent result" 
          value={`${analytics.latest.mark}%`} 
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          variant="blue"
        />
        <SmallMetricCard 
          label="Growth Index" 
          value={`${analytics.trend > 0 ? '+' : ''}${analytics.trend}%`} 
          icon={analytics.trend >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          variant={analytics.trend >= 0 ? "emerald" : "red"}
        />
      </div>

      {/* 2. Official Examination Results Ledger */}
      <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5" /> Official Exam Results
          </CardTitle>
          <Badge className="bg-white border-slate-200 text-slate-400 font-bold h-5 px-2 text-[8px] uppercase tracking-widest">
            {examMarks.length} Assessment(s) Profiled
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/10 border-b border-slate-50">
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Date</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment Module</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Score Output</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.history.map((entry, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-900 uppercase">{format(new Date(entry.examId.date), 'MMM do')}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(entry.examId.date), 'yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <Zap className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-slate-800 leading-none">{entry.examId.nameEn}</p>
                          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">{entry.examId.type || 'Standard Term'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black border-none shadow-none",
                        entry.mark >= 75 ? "bg-emerald-50 text-emerald-700" : entry.mark >= 40 ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {entry.mark}% Marks
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SmallMetricCard({ label, value, icon, variant }: any) {
  const styles: any = {
    indigo: "border-indigo-100",
    blue: "border-blue-100",
    emerald: "border-emerald-100",
    red: "border-red-100"
  };

  return (
    <div className={cn("p-4 rounded-xl border flex items-center justify-between bg-white shadow-sm ring-1 ring-slate-100", styles[variant])}>
       <div className="space-y-0.5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
       </div>
       <div className="h-8 w-8 rounded-lg bg-slate-50/50 flex items-center justify-center border border-slate-50">
          {icon}
       </div>
    </div>
  );
}
