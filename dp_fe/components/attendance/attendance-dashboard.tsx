"use client"

import { useState } from "react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { CalendarCheck, Users, UserCheck, UserX, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceDatePicker } from "./attendance-date-picker"
import { AttendanceDateDisplay } from "./attendance-date-display"
import { AttendanceMobileView } from "./attendance-mobile-view"
import { useAttendanceStats } from "@/hooks/useAttendance"
import { useGrades } from "@/hooks/useGrades"

export function AttendanceDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(), // Default to today
  })

  const { data: grades = [] } = useGrades()
  
  const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : ""
  const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : startDate

  const { data: stats = [], isLoading } = useAttendanceStats(startDate, endDate)

  // Aggregate total stats
  const totalStats = stats.reduce(
    (acc, curr) => ({
      present: acc.present + curr.present,
      absent: acc.absent + curr.absent,
      late: acc.late + curr.late,
      total: acc.total + curr.total,
    }),
    { present: 0, absent: 0, late: 0, total: 0 }
  )

  const attendanceRate = totalStats.total > 0 
    ? Math.round((totalStats.present / totalStats.total) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of student attendance for the selected period.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AttendanceDateDisplay date={date} />
          <AttendanceDatePicker date={date} setDate={setDate} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.present}</div>
            <p className="text-xs text-muted-foreground">
              Students present
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.absent}</div>
            <p className="text-xs text-muted-foreground">
              Students absent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.late}</div>
            <p className="text-xs text-muted-foreground">
              Students late
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CalendarCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average attendance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        <h3 className="text-lg font-semibold mb-4">Grade-wise Breakdown</h3>
        <AttendanceMobileView stats={stats} grades={grades} />
      </div>

      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Grade-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {grades.map(grade => {
                const gradeRecords = stats.filter(s => s.gradeId === grade.id)
                const present = gradeRecords.reduce((acc, curr) => acc + curr.present, 0)
                const absent = gradeRecords.reduce((acc, curr) => acc + curr.absent, 0)
                const late = gradeRecords.reduce((acc, curr) => acc + curr.late, 0)
                const total = gradeRecords.reduce((acc, curr) => acc + curr.total, 0)
                const percentage = total > 0 ? Math.round((present / total) * 100) : 0

                return (
                  <div key={grade.id} className="flex items-center">
                    <div className="w-[100px] font-medium">{grade.nameSi}</div>
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div className="text-sm text-muted-foreground">
                        Present: <span className="font-medium text-foreground">{present}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Absent: <span className="font-medium text-foreground">{absent}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Late: <span className="font-medium text-foreground">{late}</span>
                      </div>
                      <div className="text-right font-bold">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
