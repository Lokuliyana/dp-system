import type { Student, AttendanceRecord, StudentMarks } from "@/testData"
import { AttendanceService } from "./attendance-service"
import { MarksService } from "./marks-service"

export interface AnalyticsMetrics {
  totalStudents: number
  excellentPerformers: number
  goodPerformers: number
  averagePerformers: number
  needsImprovement: number
  lowAttendanceStudents: number
  topAttendancePercentage: number
  lowestAttendancePercentage: number
  averageClassAttendance: number
  averageClassMarks: number
}

export class AnalyticsService {
  static generateMetrics(students: Student[], records: AttendanceRecord[], marks: StudentMarks[]): AnalyticsMetrics {
    const attendancePercentages = students.map((s) => AttendanceService.calculateAttendancePercentage(records, s.id))

    return {
      totalStudents: students.length,
      excellentPerformers: students.filter((s) => s.academicPerformance === "excellent").length,
      goodPerformers: students.filter((s) => s.academicPerformance === "good").length,
      averagePerformers: students.filter((s) => s.academicPerformance === "average").length,
      needsImprovement: students.filter((s) => s.academicPerformance === "needs-improvement").length,
      lowAttendanceStudents: AttendanceService.getStudentsWithLowAttendance(students, records, 75).length,
      topAttendancePercentage: Math.max(...attendancePercentages, 0),
      lowestAttendancePercentage: Math.min(...attendancePercentages.filter((p) => p > 0), 100),
      averageClassAttendance: Math.round(
        attendancePercentages.reduce((a, b) => a + b, 0) / attendancePercentages.length,
      ),
      averageClassMarks: MarksService.getClassAverageMarks(
        marks,
        students.map((s) => s.id),
      ),
    }
  }

  static getPerformanceDistribution(students: Student[]): Record<string, number> {
    return {
      excellent: students.filter((s) => s.academicPerformance === "excellent").length,
      good: students.filter((s) => s.academicPerformance === "good").length,
      average: students.filter((s) => s.academicPerformance === "average").length,
      "needs-improvement": students.filter((s) => s.academicPerformance === "needs-improvement").length,
    }
  }

  static getAttendanceTrend(records: AttendanceRecord[], studentId: string, days = 30): number[] {
    const studentRecords = records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const trend: number[] = []
    const lastRecords = studentRecords.slice(-days)

    for (let i = 0; i < days; i++) {
      const dayRecords = lastRecords.filter((r) => {
        const date = new Date(r.date)
        return date.getDate() === i + 1
      })

      const presentCount = dayRecords.filter((r) => r.status === "present").length
      trend.push(presentCount > 0 ? 100 : 0)
    }

    return trend
  }

  static identifyAtRiskStudents(
    students: Student[],
    records: AttendanceRecord[],
    marks: StudentMarks[],
    attendanceThreshold = 75,
    marksThreshold = 50,
  ): Student[] {
    return students.filter((student) => {
      const attendance = AttendanceService.calculateAttendancePercentage(records, student.id)
      const avgMarks = MarksService.getStudentAverageMarks(marks, student.id)
      return attendance < attendanceThreshold && avgMarks < marksThreshold
    })
  }
}
