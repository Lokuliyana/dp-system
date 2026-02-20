"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { FileText, Trophy, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { useStudentExamHistory } from "@/hooks/useExams";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function StudentExamsTab({ student }: { student: any }) {
  const studentId = student.id || student._id;
  const { data: history = [], isLoading } = useStudentExamHistory(studentId);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    
    const presentExams = history.filter((h: any) => h.isPresent);
    const averageMark = presentExams.length > 0 
      ? Math.round(presentExams.reduce((acc: number, curr: any) => acc + curr.mark, 0) / presentExams.length)
      : 0;
    
    const bestMark = presentExams.length > 0
      ? Math.max(...presentExams.map((h: any) => h.mark))
      : 0;

    return {
      total: history.length,
      present: presentExams.length,
      absent: history.length - presentExams.length,
      averageMark,
      bestMark
    };
  }, [history]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading exam history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <FileText className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Exam Records</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          This student has not participated in any exams yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-indigo-50/30 ring-1 ring-indigo-100">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Average Mark</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-indigo-700">{stats?.averageMark}</p>
                <span className="text-sm font-bold text-indigo-400">/ 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50/30 ring-1 ring-emerald-100">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Best Performance</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-emerald-700">{stats?.bestMark}</p>
                <span className="text-sm font-bold text-emerald-400">/ 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50/50 ring-1 ring-slate-100">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Exams</p>
              <p className="text-3xl font-black text-slate-700">{stats?.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-red-50/30 ring-1 ring-red-100">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Absents</p>
              <p className="text-3xl font-black text-red-700">{stats?.absent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed History */}
      <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-indigo-500" />
            Exam History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Exam Name</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Grade</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Date</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Result</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{entry.examId?.nameSi}</span>
                          <span className="text-[10px] text-slate-500">{entry.examId?.nameEn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {entry.gradeId?.nameEn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-500 gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="font-medium">{entry.examId?.date ? format(new Date(entry.examId.date), "MMM d, yyyy") : "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {entry.isPresent ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={cn(
                            "text-lg font-black",
                            entry.mark >= 75 ? "text-emerald-600" : 
                            entry.mark >= 50 ? "text-amber-600" : "text-red-600"
                          )}>
                            {entry.mark}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={entry.isPresent ? "outline" : "destructive"} className={cn(
                        "text-[10px] uppercase font-bold tracking-tight",
                        entry.isPresent && "bg-emerald-50 text-emerald-700 border-none"
                      )}>
                        {entry.isPresent ? "Completed" : "Absent"}
                      </Badge>
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
