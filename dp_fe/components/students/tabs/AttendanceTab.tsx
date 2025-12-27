"use client";

import { useState, useMemo } from "react";
import type { Student } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "leave";
  remarks?: string;
}

interface AttendanceTabProps {
  student: Student;
  attendanceData?: AttendanceRecord[];
}

export function AttendanceTab({ student, attendanceData }: AttendanceTabProps) {
  // For now: generate synthetic demo data; later you can replace with real records via props
  const [syntheticAttendance] = useState<AttendanceRecord[]>(() => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;

      const random = Math.random();
      const status = random > 0.92 ? "leave" : random > 0.85 ? "absent" : "present";
      records.push({
        date: date.toISOString().split("T")[0],
        status: status as any,
        remarks: status === "leave" ? "Medical Leave" : undefined,
      });
    }
    return records;
  });

  const attendanceRecords = attendanceData || syntheticAttendance;

  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all");

  const statistics = useMemo(() => {
    const filtered =
      filterStatus === "all" ? attendanceRecords : attendanceRecords.filter((r) => r.status === filterStatus);

    const total = filtered.length;
    const present = filtered.filter((r) => r.status === "present").length;
    const absent = filtered.filter((r) => r.status === "absent").length;
    const leave = filtered.filter((r) => r.status === "leave").length;

    const attendancePercentage = total > 0 ? Math.round((present / (present + absent)) * 100) : 0;
    const lastAbsentDate = attendanceRecords.filter((r) => r.status === "absent").slice(-1)[0]?.date;
    const consecutivePresent = attendanceRecords
      .slice()
      .reverse()
      .findIndex((r) => r.status !== "present");

    return {
      total,
      present,
      absent,
      leave,
      attendancePercentage,
      lastAbsentDate,
      consecutivePresent: consecutivePresent === -1 ? attendanceRecords.length : consecutivePresent,
    };
  }, [attendanceRecords, filterStatus]);

  const groupedByMonth = useMemo(() => {
    const grouped: Record<string, AttendanceRecord[]> = {};
    attendanceRecords.forEach((record) => {
      const month = record.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(record);
    });
    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, records]) => ({
        month,
        records: filterStatus === "all" ? records : records.filter((r) => r.status === filterStatus),
      }));
  }, [attendanceRecords, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-50 border-green-200 text-green-700";
      case "absent":
        return "bg-red-50 border-red-200 text-red-700";
      case "leave":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "leave":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Attendance %</p>
            <p
              className={`text-3xl font-bold ${
                statistics.attendancePercentage >= 80 ? "text-green-600" : "text-amber-600"
              }`}
            >
              {statistics.attendancePercentage}%
            </p>
            <p className="text-xs text-slate-500">Based on present/absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="flex items-center gap-1 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Present
            </p>
            <p className="text-3xl font-bold text-green-600">{statistics.present}</p>
            <p className="text-xs text-slate-500">Total days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="flex items-center gap-1 text-sm text-slate-600">
              <XCircle className="h-4 w-4 text-red-600" />
              Absent
            </p>
            <p className="text-3xl font-bold text-red-600">{statistics.absent}</p>
            <p className="text-xs text-slate-500">Total days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="flex items-center gap-1 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Leave
            </p>
            <p className="text-3xl font-bold text-blue-600">{statistics.leave}</p>
            <p className="text-xs text-slate-500">Total days</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Attendance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded border border-indigo-100 bg-white p-3">
              <p className="text-sm text-slate-600">Consecutive Present Days</p>
              <p className="text-2xl font-bold text-indigo-600">{statistics.consecutivePresent}</p>
            </div>
            {statistics.lastAbsentDate && (
              <div className="rounded border border-indigo-100 bg-white p-3">
                <p className="text-sm text-slate-600">Last Absent</p>
                <p className="text-lg font-bold text-indigo-600">
                  {new Date(statistics.lastAbsentDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-700">
            {statistics.attendancePercentage >= 90
              ? "Excellent attendance record."
              : statistics.attendancePercentage >= 80
              ? "Good attendance. Target 90% for stronger performance."
              : "Attendance below 80%. Monitor closely."}
          </p>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Attendance History
            </CardTitle>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedByMonth.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No attendance records</p>
          ) : (
            groupedByMonth.map(({ month, records }) => (
              <div key={month} className="space-y-3">
                <h3 className="font-semibold text-slate-900">
                  {new Date(month + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </h3>
                {records.length === 0 ? (
                  <p className="text-sm italic text-slate-500">
                    No records for this month with selected filter.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
                    {records.map((record) => (
                      <div
                        key={record.date}
                        className={`space-y-1 rounded border p-3 text-center text-sm ${getStatusColor(
                          record.status
                        )}`}
                      >
                        <div className="flex justify-center">{getStatusIcon(record.status)}</div>
                        <p className="font-medium capitalize">{record.status}</p>
                        <p className="font-mono text-xs">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {record.remarks && (
                          <p className="text-xs font-medium">{record.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
