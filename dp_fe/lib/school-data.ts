import type React from "react"

export interface Talent {
  id: string
  name: string
  category: "academic" | "sports" | "arts" | "leadership" | "other"
  level: "beginner" | "intermediate" | "advanced" | "expert"
  description: string
}

export interface StudentNote {
  id: string
  date: string
  title: string
  content: string
  category: "academic" | "behavioral" | "health" | "personal" | "achievement"
  author: string
  isPrivate: boolean
}

export interface Student {
  id: string
  gradeId: string | { _id: string; nameEn: string; level?: number }
  admissionNumber: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  enrollmentDate: string
  parentName: string
  parentPhone: string
  address: string
  status: "active" | "inactive" | "transferred" | "graduated"
  academicPerformance: "excellent" | "good" | "average" | "needs-improvement"
  talents: Talent[]
  notes: StudentNote[]
  phoneNumber: string
  nameWithInitialsSi: string
  fullNameSi?: string
  fullNameEn?: string
  whatsappNumber?: string
  dob?: string
  sex?: "male" | "female"
  birthCertificateNumber?: string
  admittedGrade?: string
  medium?: "sinhala" | "english" | "tamil"
  academicYear: number
  addressSi?: string
  addressEn?: string
  phoneNum?: string
  emergencyNumber?: string
  motherNameEn?: string
  motherNumber?: string
  motherOccupation?: string
  fatherNameEn?: string
  fatherNumber?: string
  fatherOccupation?: string
  photoUrl?: string
  activeNote?: string
  inactiveNote?: string
}

export interface Grade {
  id: string
  name: string
  level: number
  section: string
  totalStrength: number
  classTeacher: string
}

export interface LayoutTab {
  id: string
  label: string
  icon?: React.ReactNode
  component: React.ComponentType<any>
  badge?: string | number
}

// Sample grades (1-13)
export const GRADES: Grade[] = Array.from({ length: 13 }, (_, i) => ({
  id: `grade-${i + 1}`,
  name: `Grade ${i + 1}`,
  level: i + 1,
  section: "A",
  totalStrength: 35 + Math.floor(Math.random() * 10),
  classTeacher: `Teacher ${String.fromCharCode(65 + (i % 5))}`,
}))

export const TALENT_CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "leadership", label: "Leadership" },
  { value: "other", label: "Other" },
]

export const NOTE_CATEGORIES = [
  { value: "academic", label: "Academic Progress" },
  { value: "behavioral", label: "Behavior" },
  { value: "health", label: "Health & Wellness" },
  { value: "personal", label: "Personal Development" },
  { value: "achievement", label: "Achievement" },
]

// Generate sample students for each grade
export function generateSampleStudents(): Student[] {
  const students: Student[] = []
  const firstNames = ["Aisha", "Raj", "Emma", "Liam", "Zara", "Marcus", "Sofia", "James", "Nina", "David"]
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore"]

  GRADES.forEach((grade) => {
    for (let i = 1; i <= 35; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      students.push({
        id: `${grade.id}-student-${i}`,
        gradeId: grade.id,
        admissionNumber: `25/${String(i).padStart(4, "0")}`,
        firstName: firstName,
        lastName: lastName,
        nameWithInitialsSi: `${firstName.charAt(0)}. ${lastName}`,
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
        academicYear: new Date().getFullYear(),
      })
    }
  })

  return students
}
