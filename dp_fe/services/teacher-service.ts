import type { Teacher, TeacherResponsibility } from "@/testData"

export class TeacherService {
  static getTeacherById(teachers: Teacher[], id: string): Teacher | undefined {
    return teachers.find((t) => t.id === id)
  }

  static getTeachersByDepartment(teachers: Teacher[], department: string): Teacher[] {
    return teachers.filter((t) => t.department === department)
  }

  static getTeachersWithPosition(teachers: Teacher[], position: string): Teacher[] {
    return teachers.filter((t) => t.positions.includes(position as any))
  }

  static getTeacherFullName(teacher: Teacher): string {
    return `${teacher.firstName} ${teacher.lastName}`
  }

  static getResponsibilitiesByIds(responsibilities: TeacherResponsibility[], ids: string[]): TeacherResponsibility[] {
    return responsibilities.filter((r) => ids.includes(r.id))
  }

  static searchTeachers(teachers: Teacher[], query: string): Teacher[] {
    const lowerQuery = query.toLowerCase()
    return teachers.filter(
      (t) =>
        t.firstName.toLowerCase().includes(lowerQuery) ||
        t.lastName.toLowerCase().includes(lowerQuery) ||
        t.email.toLowerCase().includes(lowerQuery) ||
        t.department.toLowerCase().includes(lowerQuery),
    )
  }
}
