"use client";

import { useState, useMemo } from "react";
import { History, Search, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, getYear, getMonth, setMonth, setYear } from "date-fns";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { AttendanceMenu } from "@/components/attendance/attendance-menu";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Input,
  Button
} from "@/components/ui";
import { useGrades } from "@/hooks/useGrades";
import { useAttendanceByRange } from "@/hooks/useAttendance";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { cn } from "@/lib/utils";

export default function AttendanceHistoryPage() {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  
  // Date state
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(getYear(today));
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(today)); // 0-indexed
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate date range for the selected month
  const currentDate = new Date(selectedYear, selectedMonth, 1);
  const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");
  
  // Get all days in the month for columns
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // Fetch data
  const { data: attendance = [], isLoading: isLoadingAttendance } = useAttendanceByRange(startDate, endDate, selectedGradeId);
  const { data: students = [], isLoading: isLoadingStudents } = useStudentsByGrade(selectedGradeId);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(s => 
      s.firstNameEn?.toLowerCase().includes(lowerQuery) || 
      s.lastNameEn?.toLowerCase().includes(lowerQuery) ||
      s.admissionNumber.toLowerCase().includes(lowerQuery) ||
      s.nameWithInitialsSi?.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  // Process attendance data into a map for easy lookup: studentId -> day -> status
  const attendanceMap = useMemo(() => {
    const map: Record<string, Record<number, string>> = {};
    attendance.forEach(record => {
      if (!map[record.studentId]) {
        map[record.studentId] = {};
      }
      const day = getDate(new Date(record.date));
      map[record.studentId][day] = record.status;
    });
    return map;
  }, [attendance]);

  // Generate years for dropdown (e.g., current year - 5 to current year + 1)
  const years = Array.from({ length: 7 }, (_, i) => getYear(today) - 5 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <AttendanceMenu />

      <DynamicPageHeader
        title="Attendance History"
        subtitle="View monthly attendance records."
        icon={History}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-[100vw] overflow-hidden">
        {/* Controls Section */}
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">
              <div className="w-full md:w-48">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Grade</label>
                <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-32">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-40">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Month</label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => (
                      <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGradeId && (
                <div className="w-full md:w-64 md:ml-auto">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Search Student</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search name or admission..." 
                      className="pl-8 bg-white" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedGradeId && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  Attendance Sheet - {months[selectedMonth]} {selectedYear}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {filteredStudents.length} Students
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingStudents || isLoadingAttendance ? (
                <div className="p-8 text-center">Loading data...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No students found.</div>
              ) : (
                <div className="overflow-auto max-h-[600px] relative">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
                      <tr>
                        <th className="sticky left-0 z-30 bg-slate-50 border-b border-r px-4 py-3 text-left font-semibold min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          Student Name
                        </th>
                        <th className="sticky left-[200px] z-30 bg-slate-50 border-b border-r px-4 py-3 text-left font-semibold min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          Admission
                        </th>
                        {daysInMonth.map(day => (
                          <th key={day.toString()} className="border-b border-r px-2 py-3 text-center min-w-[36px] font-medium text-slate-600">
                            <div className="flex flex-col items-center">
                              <span>{getDate(day)}</span>
                              <span className="text-[10px] uppercase text-slate-400">{format(day, "EEEEE")}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id} className={cn("hover:bg-slate-50 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                          <td className="sticky left-0 z-10 bg-white border-b border-r px-4 py-2 font-medium text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {student.nameWithInitialsSi || student.fullNameEn}
                          </td>
                          <td className="sticky left-[200px] z-10 bg-white border-b border-r px-4 py-2 text-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {student.admissionNumber}
                          </td>
                          {daysInMonth.map(day => {
                            const dateNum = getDate(day);
                            const status = attendanceMap[student.id]?.[dateNum];
                            
                            let cellContent = <span className="text-slate-200">-</span>;
                            let cellClass = "";

                            if (status === "present") {
                              cellContent = <span className="font-bold text-green-600">P</span>;
                              cellClass = "bg-green-50/50";
                            } else if (status === "absent") {
                              cellContent = <span className="font-bold text-red-600">A</span>;
                              cellClass = "bg-red-50/50";
                            } else if (status === "late") {
                              cellContent = <span className="font-bold text-yellow-600">L</span>;
                              cellClass = "bg-yellow-50/50";
                            }

                            return (
                              <td key={day.toString()} className={cn("border-b border-r px-1 py-2 text-center", cellClass)}>
                                {cellContent}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutController>
  );
}
