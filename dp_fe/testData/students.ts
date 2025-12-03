import type { Student } from "./types"
import { GRADES } from "./grades"

const FIRST_NAMES = ["Aisha", "Raj", "Emma", "Liam", "Zara", "Marcus", "Sofia", "James", "Nina", "David"]
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore"]

export function generateStudents(): Student[] {
  const students: Student[] = []

  GRADES.forEach((grade) => {
    for (let i = 1; i <= 35; i++) {
      students.push({
        id: `${grade.id}-student-${i}`,
        gradeId: grade.id,
        rollNumber: i,
        firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
        lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
        email: `student${i}@school.edu`,
        dateOfBirth: new Date(
          2010 + Math.random() * 4,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        )
          .toISOString()
          .split("T")[0],
        enrollmentDate: new Date(2020, 0, 1).toISOString().split("T")[0],
        parentName: `Parent of Student ${i}`,
        parentPhone: `+1-555-${String(i).padStart(4, "0")}`,
        address: `${i} School Street, City`,
        status: "active",
        academicPerformance: ["excellent", "good", "average", "needs-improvement"][
          Math.floor(Math.random() * 4)
        ] as any,
        talents: [],
        notes: [],
        phoneNumber: `+1-555-${String(i + 1000).padStart(4, "0")}`,
      })
    }
  })

  return students
}
