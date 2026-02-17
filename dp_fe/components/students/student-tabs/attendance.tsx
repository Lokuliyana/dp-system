"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import type { Student } from "@/lib/school-data"

interface AttendanceRecord {
  date: string
  status: "present" | "absent" | "leave"
  remarks?: string
}

export function StudentAttendanceTab({ student }: { student: Student }) {
  const [attendanceRecords] = useState<AttendanceRecord[]>(() => {
    const records: AttendanceRecord[] = []
    const today = new Date()
    // Generate 3 months of attendance data
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayOfWeek = date.getDay()
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      const random = Math.random()
      const status = random > 0.92 ? "leave" : random > 0.85 ? "absent" : "present"
      records.push({
        date: date.toISOString().split("T")[0],
        status,
        remarks: status === "leave" ? "Medical Leave" : undefined,
      })
    }
    return records
  })

  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all")
  const [monthFilter, setMonthFilter] = useState<string>("")

  const statistics = useMemo(() => {
    const filtered =
      filterStatus === "all" ? attendanceRecords : attendanceRecords.filter((r) => r.status === filterStatus)

    const total = filtered.length
    const present = filtered.filter((r) => r.status === "present").length
    const absent = filtered.filter((r) => r.status === "absent").length
    const leave = filtered.filter((r) => r.status === "leave").length

    const attendancePercentage = total > 0 ? Math.round((present / (present + absent)) * 100) : 0
    const lastAbsentDate = attendanceRecords.filter((r) => r.status === "absent").slice(-1)[0]?.date
    const consecutivePresent = attendanceRecords
      .slice()
      .reverse()
      .findIndex((r) => r.status !== "present")

    return {
      total,
      present,
      absent,
      leave,
      attendancePercentage,
      lastAbsentDate,
      consecutivePresent: consecutivePresent === -1 ? attendanceRecords.length : consecutivePresent,
    }
  }, [attendanceRecords, filterStatus])

  const groupedByMonth = useMemo(() => {
    const grouped: Record<string, AttendanceRecord[]> = {}
    attendanceRecords.forEach((record) => {
      const month = record.date.substring(0, 7)
      if (!grouped[month]) grouped[month] = []
      grouped[month].push(record)
    })
    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, records]) => ({
        month,
        records: filterStatus === "all" ? records : records.filter((r) => r.status === filterStatus),
      }))
  }, [attendanceRecords, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-50 border-green-200 text-green-700"
      case "absent":
        return "bg-red-50 border-red-200 text-red-700"
      case "leave":
        return "bg-blue-50 border-blue-200 text-blue-700"
      default:
        return "bg-slate-50 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "leave":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Attendance %</p>
              <p
                className={`text-3xl font-bold ${statistics.attendancePercentage >= 80 ? "text-green-600" : "text-orange-600"}`}
              >
                {statistics.attendancePercentage}%
              </p>
              <p className="text-xs text-slate-500">Based on present/absent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Present
              </p>
              <p className="text-3xl font-bold text-green-600">{statistics.present}</p>
              <p className="text-xs text-slate-500">Total days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-600" />
                Absent
              </p>
              <p className="text-3xl font-bold text-red-600">{statistics.absent}</p>
              <p className="text-xs text-slate-500">Total days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Leave
              </p>
              <p className="text-3xl font-bold text-blue-600">{statistics.leave}</p>
              <p className="text-xs text-slate-500">Total days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Attendance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-3 border border-indigo-100">
              <p className="text-sm text-slate-600">Consecutive Present Days</p>
              <p className="text-2xl font-bold text-indigo-600">{statistics.consecutivePresent}</p>
            </div>
            {statistics.lastAbsentDate && (
              <div className="bg-white rounded p-3 border border-indigo-100">
                <p className="text-sm text-slate-600">Last Absent</p>
                <p className="text-lg font-bold text-indigo-600">
                  {new Date(statistics.lastAbsentDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-700">
            {statistics.attendancePercentage >= 90
              ? "Excellent attendance record! Keep it up."
              : statistics.attendancePercentage >= 80
                ? "Good attendance. Target 90% for better performance."
                : "Attendance below 80%. Please improve attendance."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Attendance History
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-32 h-9">
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
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedByMonth.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No attendance records found</p>
          ) : (
            groupedByMonth.map(({ month, records }) => (
              <div key={month} className="space-y-3">
                <h3 className="font-semibold text-slate-900">
                  {new Date(month + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </h3>

                {records.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No records for this month with selected filter</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {records.map((record) => (
                      <div
                        key={record.date}
                        className={`p-3 rounded border text-center text-sm space-y-1 ${getStatusColor(record.status)}`}
                      >
                        <div className="flex justify-center">{getStatusIcon(record.status)}</div>
                        <p className="font-medium capitalize">{record.status}</p>
                        <p className="text-xs font-mono">
                          {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        {record.remarks && <p className="text-xs font-medium">{record.remarks}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Month</th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Present</th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Absent</th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Leave</th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Rate %</th>
                </tr>
              </thead>
              <tbody>
                {groupedByMonth.map(({ month, records }) => {
                  const present = records.filter((r) => r.status === "present").length
                  const absent = records.filter((r) => r.status === "absent").length
                  const leave = records.filter((r) => r.status === "leave").length
                  const total = present + absent + leave
                  const rate = total > 0 ? Math.round((present / (present + absent)) * 100) : 0

                  return (
                    <tr key={month} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        {new Date(month + "-01").toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600 font-medium">{present}</td>
                      <td className="px-4 py-3 text-center text-red-600 font-medium">{absent}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-medium">{leave}</td>
                      <td className="px-4 py-3 text-center font-medium">{total}</td>
                      <td
                        className={`px-4 py-3 text-center font-bold ${rate >= 80 ? "text-green-600" : "text-orange-600"}`}
                      >
                        {rate}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
