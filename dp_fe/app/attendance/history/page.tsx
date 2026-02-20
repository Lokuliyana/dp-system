"use client";

import { useState, useMemo } from "react";
import { History, Search, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, getYear, getMonth, setMonth, setYear, isSunday, subMonths, eachWeekOfInterval, startOfDay } from "date-fns";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function AttendanceHistoryPage() {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  
  // Date state
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(getYear(today));
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(today)); // 0-indexed
  
  // View range state
  const [viewRange, setViewRange] = useState<"1m" | "6m" | "1y">("1m");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Calculate date range based on selected view range
  const { startDate, endDate, displayTitle } = useMemo(() => {
    const end = endOfMonth(new Date(selectedYear, selectedMonth, 1));
    let start;
    let title;

    if (viewRange === "1m") {
      start = startOfMonth(end);
      title = `${MONTHS[selectedMonth]} ${selectedYear}`;
    } else if (viewRange === "6m") {
      start = startOfMonth(subMonths(end, 5));
      title = `${format(start, "MMM yyyy")} - ${format(end, "MMM yyyy")}`;
    } else {
      start = startOfMonth(subMonths(end, 11));
      title = `${format(start, "MMM yyyy")} - ${format(end, "MMM yyyy")}`;
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      displayTitle: title
    };
  }, [selectedYear, selectedMonth, viewRange]);
  
  // Get all Sundays in the range for columns
  const sundaysInRange = useMemo(() => {
    return eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate)
    }).filter(date => isSunday(date));
  }, [startDate, endDate]);

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

  // Process attendance data into a map for easy lookup: studentId -> dateString -> status
  const attendanceMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    attendance.forEach(record => {
      if (!map[record.studentId]) {
        map[record.studentId] = {};
      }
      const dateStr = format(new Date(record.date), "yyyy-MM-dd");
      map[record.studentId][dateStr] = record.status;
    });
    return map;
  }, [attendance]);

  // Generate years for dropdown (e.g., current year - 5 to current year + 1)
  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => getYear(today) - 5 + i), [today]);

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <AttendanceMenu />

      <DynamicPageHeader
        title="Attendance History"
        subtitle="View monthly attendance records."
        icon={History}
        actions={[
          {
            type: "select",
            props: {
              label: "Grade",
              value: selectedGradeId,
              onValueChange: setSelectedGradeId,
              options: grades.map((g) => ({ label: g.nameEn, value: g.id })),
              placeholder: "Select Grade",
            },
          },
          {
            type: "select",
            props: {
              label: "Range",
              value: viewRange,
              onValueChange: (v: any) => setViewRange(v),
              options: [
                { label: "1 Month", value: "1m" },
                { label: "6 Months", value: "6m" },
                { label: "1 Year", value: "1y" },
              ],
            },
          },
          {
            type: "select",
            props: {
              label: "Month",
              value: selectedMonth.toString(),
              onValueChange: (v) => setSelectedMonth(parseInt(v)),
              options: MONTHS.map((m, idx) => ({ label: m, value: idx.toString() })),
            },
          },
          {
            type: "select",
            props: {
              label: "Year",
              value: selectedYear.toString(),
              onValueChange: (v) => setSelectedYear(parseInt(v)),
              options: years.map((y) => ({ label: y.toString(), value: y.toString() })),
            },
          },
          {
            type: "search",
            props: {
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search students...",
            },
          },
        ]}
      />


      <div className="p-4 md:p-6 space-y-6 max-w-[100vw] overflow-hidden">


        {selectedGradeId && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  Attendance Sheet - {displayTitle}
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
                        {sundaysInRange.map(day => (
                          <th key={day.toString()} className="border-b border-r px-2 py-3 text-center min-w-[60px] font-medium text-slate-600">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-slate-400">{format(day, "MMM")}</span>
                              <span className="text-base font-bold">{getDate(day)}</span>
                              <span className="text-[10px] uppercase text-slate-400">{format(day, "yyyy")}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id} className={cn("hover:bg-slate-50 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                          <td className="sticky left-0 z-10 bg-white border-b border-r px-4 py-2 font-medium text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {student.nameWithInitialsSi}
                          </td>
                          <td className="sticky left-[200px] z-10 bg-white border-b border-r px-4 py-2 text-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {student.admissionNumber}
                          </td>
                          {sundaysInRange.map(day => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const status = attendanceMap[student.id]?.[dateStr];
                            
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
