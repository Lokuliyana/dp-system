import type { Student, StudentMarks } from "@/testData"

export class MarksService {
  static getStudentAverageMarks(marks: StudentMarks[], studentId: string): number {
    const studentMarks = marks.filter((m) => m.studentId === studentId)
    if (studentMarks.length === 0) return 0

    const total = studentMarks.reduce((sum, m) => sum + m.marks, 0)
    return Math.round(total / studentMarks.length)
  }

  static getTopPerformers(
    students: Student[],
    marks: StudentMarks[],
    limit = 10,
  ): (Student & { averageMarks: number })[] {
    return students
      .map((student) => ({
        ...student,
        averageMarks: this.getStudentAverageMarks(marks, student.id),
      }))
      .sort((a, b) => b.averageMarks - a.averageMarks)
      .slice(0, limit)
  }

  static getUnderperformers(
    students: Student[],
    marks: StudentMarks[],
    threshold = 50,
    limit = 10,
  ): (Student & { averageMarks: number })[] {
    return students
      .map((student) => ({
        ...student,
        averageMarks: this.getStudentAverageMarks(marks, student.id),
      }))
      .filter((s) => s.averageMarks < threshold)
      .sort((a, b) => a.averageMarks - b.averageMarks)
      .slice(0, limit)
  }

  static getSubjectAverageByStudent(marks: StudentMarks[], studentId: string): Record<string, number> {
    const studentMarks = marks.filter((m) => m.studentId === studentId)
    const subjects = new Map<string, number[]>()

    studentMarks.forEach((m) => {
      if (!subjects.has(m.subject)) {
        subjects.set(m.subject, [])
      }
      subjects.get(m.subject)!.push(m.marks)
    })

    const result: Record<string, number> = {}
    subjects.forEach((values, subject) => {
      result[subject] = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    })

    return result
  }

  static getClassAverageMarks(marks: StudentMarks[], studentIds: string[]): number {
    const classMarks = marks.filter((m) => studentIds.includes(m.studentId))
    if (classMarks.length === 0) return 0

    const total = classMarks.reduce((sum, m) => sum + m.marks, 0)
    return Math.round(total / classMarks.length)
  }
}
