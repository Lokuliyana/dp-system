import type { Student } from "@/lib/school-data";

export function createNewStudent(gradeId: string, existing: Student[]): Student {
  const maxRoll = existing.length ? Math.max(...existing.map((s) => s.rollNumber)) : 0;

  return {
    id: `${gradeId}-student-${Date.now()}`,
    gradeId,
    rollNumber: maxRoll + 1,
    firstName: "New",
    lastName: "Student",
    email: "student@school.edu",
    dateOfBirth: "2010-01-01",
    enrollmentDate: new Date().toISOString().split("T")[0],
    parentName: "",
    parentPhone: "",
    address: "",
    status: "active",
    academicPerformance: "average",
    talents: [],
    notes: [],
    phoneNumber: "",
  };
}
