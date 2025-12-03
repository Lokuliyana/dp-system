import type { Student, AttendanceRecord } from "@/testData"

export class AttendanceService {
  static calculateAttendancePercentage(records: AttendanceRecord[], studentId: string): number {
    const studentRecords = records.filter((r) => r.studentId === studentId)
    if (studentRecords.length === 0) return 0

    const presentDays = studentRecords.filter((r) => r.status === "present").length
    return Math.round((presentDays / studentRecords.length) * 100)
  }

  static getStudentsWithLowAttendance(students: Student[], records: AttendanceRecord[], threshold = 75): Student[] {
    return students.filter((student) => {
      const percentage = this.calculateAttendancePercentage(records, student.id)
      return percentage < threshold
    })
  }

  static getStudentsWithGoodAttendance(students: Student[], records: AttendanceRecord[], threshold = 90): Student[] {
    return students.filter((student) => {
      const percentage = this.calculateAttendancePercentage(records, student.id)
      return percentage >= threshold
    })
  }

  static getConsecutivePresentDays(records: AttendanceRecord[], studentId: string): number {
    const studentRecords = records
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let consecutive = 0
    for (const record of studentRecords) {
      if (record.status === "present") {
        consecutive++
      } else {
        break
      }
    }
    return consecutive
  }

  static getLastAbsentDate(records: AttendanceRecord[], studentId: string): string | null {
    const lastAbsent = records
      .filter((r) => r.studentId === studentId && r.status === "absent")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return lastAbsent?.date || null
  }

  static getAbsenceCount(records: AttendanceRecord[], studentId: string): number {
    return records.filter((r) => r.studentId === studentId && r.status === "absent").length
  }

  static getLeaveCount(records: AttendanceRecord[], studentId: string): number {
    return records.filter((r) => r.studentId === studentId && r.status === "leave").length
  }
}
