import type { Student } from "@/testData"

export class StudentService {
  static getStudentById(students: Student[], id: string): Student | undefined {
    return students.find((s) => s.id === id)
  }

  static getStudentsByGrade(students: Student[], gradeId: string): Student[] {
    return students.filter((s) => s.gradeId === gradeId)
  }

  static getStudentsByPerformance(students: Student[], performance: string): Student[] {
    return students.filter((s) => s.academicPerformance === performance)
  }

  static searchStudents(students: Student[], query: string): Student[] {
    const lowerQuery = query.toLowerCase()
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(lowerQuery) ||
        s.lastName.toLowerCase().includes(lowerQuery) ||
        s.email.toLowerCase().includes(lowerQuery) ||
        s.rollNumber.toString().includes(lowerQuery),
    )
  }

  static getStudentFullName(student: Student): string {
    return `${student.firstName} ${student.lastName}`
  }
}
