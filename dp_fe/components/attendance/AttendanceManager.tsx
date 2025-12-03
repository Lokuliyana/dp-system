"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  X,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/school-data";

type AttendanceStatus = "present" | "absent";

interface Grade {
  id: string;
  name: string;
}

interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

interface AttendanceManagerProps {
  students: Student[];
  grades: Grade[];
  onSaveDay?: (date: string, gradeId: string, records: AttendanceRecord[]) => void;
}

export function AttendanceManager({ students, grades, onSaveDay }: AttendanceManagerProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0]?.id || "");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [markAll, setMarkAll] = useState<AttendanceStatus | null>(null);
  const [savedAbsentList, setSavedAbsentList] = useState<Student[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // month context for desktop Sunday grid
  const [currentDate, setCurrentDate] = useState(new Date());

  // simple responsive flag
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const gradeStudents = useMemo(
    () => (selectedGrade ? students.filter((s) => s.gradeId === selectedGrade) : []),
    [students, selectedGrade],
  );

  // ========== DATE HELPERS ==========

  const formatDateOnly = (d: Date | string) => {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toISOString().split("T")[0];
  };

  // Sundays for current month (desktop view)
  const sundaysInMonth = useMemo(() => {
    const sundays: Date[] = [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    while (date.getMonth() === currentDate.getMonth()) {
      if (date.getDay() === 0) {
        sundays.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return sundays;
  }, [currentDate]);

  // "This week Sunday" (mobile view focus)
  const thisWeekSunday = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  }, []);

  const thisWeekSundayStr = formatDateOnly(thisWeekSunday);

  // ========== RECORD HELPERS ==========

  const setStatusForDate = (studentId: string, dateStr: string, status: AttendanceStatus | null) => {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.studentId === studentId && r.date === dateStr);
      const next = [...prev];

      if (status === null) {
        if (idx >= 0) next.splice(idx, 1);
        return next;
      }

      if (idx >= 0) {
        next[idx] = { ...next[idx], status };
      } else {
        next.push({ studentId, date: dateStr, status });
      }
      return next;
    });
  };

  const getStatusForDate = (studentId: string, dateStr: string): AttendanceStatus | null => {
    const rec = records.find((r) => r.studentId === studentId && r.date === dateStr);
    return rec?.status ?? null;
  };

  // toggle cycle for desktop Sunday cells: present -> absent -> unmarked -> present
  const toggleSundayStatus = (studentId: string, date: Date) => {
    const dateStr = formatDateOnly(date);
    const current = getStatusForDate(studentId, dateStr);
    let next: AttendanceStatus | null;

    if (current === "present") next = "absent";
    else if (current === "absent") next = null;
    else next = "present";

    setStatusForDate(studentId, dateStr, next);
  };

  // bulk mark for this week's Sunday (mobile)
  const handleMarkAll = (status: AttendanceStatus) => {
    if (!gradeStudents.length) return;
    const dateStr = thisWeekSundayStr;
    setRecords((prev) => {
      const otherDates = prev.filter((r) => r.date !== dateStr || !gradeStudents.some((s) => s.id === r.studentId));
      const newForDay: AttendanceRecord[] = gradeStudents.map((s) => ({
        studentId: s.id,
        date: dateStr,
        status,
      }));
      return [...otherDates, ...newForDay];
    });
    setMarkAll(status);
  };

  // per student mark for this week's Sunday (mobile)
  const handleMarkStudentToday = (studentId: string, status: AttendanceStatus) => {
    setStatusForDate(studentId, thisWeekSundayStr, status);
  };

  // stats for this week's Sunday (mobile)
  const attendanceStats = useMemo(() => {
    const forDay = records.filter((r) => r.date === thisWeekSundayStr && gradeStudents.some((s) => s.id === r.studentId));
    const present = forDay.filter((r) => r.status === "present").length;
    const absent = forDay.filter((r) => r.status === "absent").length;
    return {
      present,
      absent,
      total: gradeStudents.length,
    };
  }, [records, thisWeekSundayStr, gradeStudents]);

  // ========== SAVE / EXPORT / COPY ==========

  const handleSaveToday = () => {
    const dateStr = thisWeekSundayStr;
    const forDay = gradeStudents.map((student) => {
      const status = getStatusForDate(student.id, dateStr) || "present";
      return { studentId: student.id, date: dateStr, status };
    });

    const absentStudents = gradeStudents.filter(
      (s) => (getStatusForDate(s.id, dateStr) || "present") === "absent",
    );
    setSavedAbsentList(absentStudents);
    setIsSaved(true);

    onSaveDay?.(dateStr, selectedGrade, forDay);
  };

  const copyAbsentList = () => {
    const text = savedAbsentList
      .map((s) => `${s.rollNumber}. ${s.firstName} ${s.lastName}`)
      .join("\n");
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const downloadAbsentList = () => {
    const text =
      `Absent Students - ${new Date().toLocaleDateString()}\n` +
      `${"=".repeat(40)}\n\n` +
      (savedAbsentList
        .map((s) => `${s.rollNumber}. ${s.firstName} ${s.lastName}`)
        .join("\n") || "No absent students");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absent-list-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSundayCSV = (): string => {
    const headers = ["Student", "Roll", ...sundaysInMonth.map((d) => formatDateOnly(d))];
    const rows: string[] = [headers.join(",")];

    gradeStudents.forEach((s) => {
      const cols: string[] = [];
      cols.push(`${s.firstName} ${s.lastName}`);
      cols.push(String(s.rollNumber ?? ""));
      sundaysInMonth.forEach((d) => {
        const status = getStatusForDate(s.id, formatDateOnly(d));
        cols.push(
          status === "present" ? "P" : status === "absent" ? "A" : status === "leave" ? "L" : "",
        );
      });
      rows.push(cols.join(","));
    });

    return rows.join("\n");
  };

  const downloadSundayCSV = () => {
    const csv = generateSundayCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-sundays-${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // ========== RENDER ==========

  return (
    <div className="space-y-6">
      {/* Grade selection (common) */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Select Grade</h2>
            <p className="text-sm text-muted-foreground">
              Choose a grade to view and mark attendance.
            </p>
          </div>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full md:w-60">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Nothing if no grade */}
      {!selectedGrade && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Please select a grade to continue.
        </Card>
      )}

      {selectedGrade && (
        <>
          {/* MOBILE VIEW: this week Sunday only (card grid) */}
          {isMobile && (
            <div className="space-y-6">
              {/* Stats for this Sunday */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Present", value: attendanceStats.present, color: "bg-green-100 text-green-700" },
                  { label: "Absent", value: attendanceStats.absent, color: "bg-red-100 text-red-700" },
                  { label: "Total", value: attendanceStats.total, color: "bg-blue-100 text-blue-700" },
                ].map((stat) => (
                  <Card key={stat.label} className={cn("p-4 text-center", stat.color)}>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                  </Card>
                ))}
              </div>

              {/* Bulk actions for this week Sunday */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleMarkAll("present")}
                    variant={markAll === "present" ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button
                    onClick={() => handleMarkAll("absent")}
                    variant={markAll === "absent" ? "destructive" : "outline"}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Mark All Absent
                  </Button>
                  <Button
                    onClick={() => {
                      // clear only this Sunday's records for grade
                      const dateStr = thisWeekSundayStr;
                      setRecords((prev) =>
                        prev.filter(
                          (r) =>
                            r.date !== dateStr ||
                            !gradeStudents.some((s) => s.id === r.studentId),
                        ),
                      );
                      setMarkAll(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Marking for:{" "}
                  {thisWeekSunday.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Card>

              {/* Student cards for this Sunday */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Students</h3>
                <div className="grid grid-cols-1 gap-3">
                  {gradeStudents.map((student) => {
                    const status = getStatusForDate(student.id, thisWeekSundayStr);
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          status === "present" && "border-green-500 bg-green-50",
                          status === "absent" && "border-red-500 bg-red-50",
                          !status && "border-border bg-card",
                        )}
                      >
                        <div className="font-medium text-base">
                          {student.rollNumber}. {student.firstName} {student.lastName}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleMarkStudentToday(student.id, "present")}
                            size="sm"
                            variant={status === "present" ? "default" : "outline"}
                            className={cn(
                              "flex-1 text-xs",
                              status === "present" && "bg-green-600 hover:bg-green-700",
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleMarkStudentToday(student.id, "absent")}
                            size="sm"
                            variant={status === "absent" ? "destructive" : "outline"}
                            className="flex-1 text-xs"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button onClick={handleSaveToday} className="w-full h-11">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Save Attendance
                  </Button>
                </div>
              </Card>

              {/* Saved absent list / all present indicator */}
              {isSaved && savedAbsentList.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h3 className="text-base font-semibold text-red-600">Absent Students</h3>
                  </div>

                  <div className="space-y-2">
                    {savedAbsentList.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white"
                      >
                        <span className="font-medium text-sm">
                          {student.rollNumber}. {student.firstName} {student.lastName}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button
                      onClick={copyAbsentList}
                      variant="outline"
                      className="flex-1 h-9 bg-transparent"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy List
                    </Button>
                    <Button
                      onClick={downloadAbsentList}
                      variant="outline"
                      className="flex-1 h-9 bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
              )}

              {isSaved && savedAbsentList.length === 0 && (
                <Card className="p-4 text-center border-green-200 bg-green-50">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-600">All students present!</p>
                </Card>
              )}
            </div>
          )}

          {/* DESKTOP VIEW: full Sunday grid for the month */}
          {!isMobile && (
            <div className="space-y-6">
              {/* Header / export */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sunday Attendance Tracker</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={downloadSundayCSV}
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Month navigation */}
              <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={previousMonth}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold min-w-[180px] text-center">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    onClick={nextMonth}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 flex gap-2 flex-wrap">
                  {grades.map((grade) => (
                    <Button
                      key={grade.id}
                      onClick={() => setSelectedGrade(grade.id)}
                      variant={selectedGrade === grade.id ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                    >
                      {grade.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sunday grid */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold border-r border-slate-200 sticky left-0 bg-slate-100 min-w-[220px]">
                            Student Name
                          </th>
                          {sundaysInMonth.map((sunday) => (
                            <th
                              key={sunday.toISOString()}
                              className="px-3 py-3 text-center font-semibold border-r border-slate-200"
                            >
                              <div className="text-xs">
                                <div>
                                  {sunday.toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </div>
                                <div className="font-bold text-sm">
                                  {sunday.getDate()}
                                </div>
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center font-semibold">Total Present</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 border-r border-slate-200 sticky left-0 bg-white font-medium">
                              <div>
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-slate-500">
                                Roll: {student.rollNumber}
                              </div>
                            </td>
                            {sundaysInMonth.map((sunday) => {
                              const dateStr = formatDateOnly(sunday);
                              const status = getStatusForDate(student.id, dateStr);
                              return (
                                <td
                                  key={sunday.toISOString()}
                                  className="px-3 py-3 text-center border-r border-slate-200 cursor-pointer"
                                  onClick={() => toggleSundayStatus(student.id, sunday)}
                                >
                                  <Button
                                    variant={
                                      status === "present"
                                        ? "default"
                                        : status === "absent"
                                        ? "outline"
                                        : "ghost"
                                    }
                                    size="sm"
                                    className={cn(
                                      "h-8 w-8 p-0",
                                      status === "present" &&
                                        "bg-green-600 hover:bg-green-700 text-white",
                                      status === "absent" &&
                                        "bg-red-100 border-red-300 text-red-700 hover:bg-red-200",
                                    )}
                                  >
                                    {status === "present"
                                      ? "P"
                                      : status === "absent"
                                      ? "A"
                                      : "-"}
                                  </Button>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center font-semibold">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {
                                  records.filter(
                                    (r) =>
                                      r.studentId === student.id &&
                                      r.status === "present" &&
                                      sundaysInMonth.some(
                                        (d) => formatDateOnly(d) === r.date,
                                      ),
                                  ).length
                                }
                                /{sundaysInMonth.length}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-6 w-6 p-0 bg-green-600"
                  >
                    P
                  </Button>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 bg-red-100 text-red-700 border-red-300"
                  >
                    A
                  </Button>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    -
                  </Button>
                  <span>Not marked</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
