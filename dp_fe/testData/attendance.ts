import type { AttendanceRecord } from "./types"
import { generateStudents } from "./students"

export function generateAttendanceRecords(): AttendanceRecord[] {
  const students = generateStudents()
  const records: AttendanceRecord[] = []
  const today = new Date()

  students.forEach((student) => {
    // Generate 90 days of attendance records
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Skip weekends randomly
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const statusRand = Math.random()
      const status = statusRand > 0.85 ? "absent" : statusRand > 0.92 ? "leave" : "present"

      records.push({
        id: `${student.id}-attendance-${dateStr}`,
        studentId: student.id,
        date: dateStr,
        status: status as any,
        notes: status === "leave" ? "Approved leave" : undefined,
      })
    }
  })

  return records
}
