"use client"

export type TeacherPosition =
  | "class-teacher"
  | "subject-coordinator"
  | "house-master"
  | "discipline-master"
  | "arts-coordinator"
  | "sports-coordinator"
  | "cultural-coordinator"
  | "admin-head"
  | "principal"
  | "vice-principal"

export type PrefectRank = "prefect" | "vice-prefect" | "head-prefect"

export type ClubCategory =
  | "academic"
  | "sports"
  | "arts"
  | "music"
  | "environmental"
  | "social-service"
  | "technology"
  | "debate"

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  qualification: string
  experience: number
  joiningDate: string
  department: string
  positions: TeacherPosition[]
  squads: string[]
  responsibilities: string[] // IDs of assigned responsibilities
  status: "active" | "inactive" | "on-leave"
}

export interface Prefect {
  id: string
  studentId: string
  firstName: string
  lastName: string
  gradeId: string
  rank: PrefectRank
  year: number
  appointmentDate: string
  responsibilities: string[] // IDs of assigned responsibilities
}

export interface Club {
  id: string
  name: string
  category: ClubCategory
  description: string
  masterInChargeId: string
  masterInChargeName: string
  foundedYear: number
  members: string[]
  president?: string
  vicePresident?: string
  secretary?: string
  status: "active" | "inactive"
}

export interface ClubMembership {
  id: string
  studentId: string
  firstName: string
  lastName: string
  gradeId: string
  clubId: string
  role: "member" | "president" | "vice-president" | "secretary"
  joinedDate: string
}

export const TEACHER_POSITIONS: { value: TeacherPosition; label: string }[] = [
  { value: "class-teacher", label: "Class Teacher" },
  { value: "subject-coordinator", label: "Subject Coordinator" },
  { value: "house-master", label: "House Master" },
  { value: "discipline-master", label: "Discipline Master" },
  { value: "arts-coordinator", label: "Arts Coordinator" },
  { value: "sports-coordinator", label: "Sports Coordinator" },
  { value: "cultural-coordinator", label: "Cultural Coordinator" },
  { value: "admin-head", label: "Admin Head" },
  { value: "principal", label: "Principal" },
  { value: "vice-principal", label: "Vice Principal" },
]

export const TEACHER_SQUADS = [
  "Curriculum",
  "Discipline",
  "Sports",
  "Cultural",
  "Examination",
  "Infrastructure",
  "Health & Wellness",
  "ICT",
  "Co-Curricular",
  "Admissions",
]

export const CLUB_CATEGORIES: { value: ClubCategory; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts & Crafts" },
  { value: "music", label: "Music" },
  { value: "environmental", label: "Environmental" },
  { value: "social-service", label: "Social Service" },
  { value: "technology", label: "Technology" },
  { value: "debate", label: "Debate" },
]

export interface TeacherResponsibility {
  id: string
  title: string
  description: string
  createdDate: string
  category: "academic" | "administrative" | "discipline" | "co-curricular"
}

export interface PrefectResponsibility {
  id: string
  title: string
  description: string
  createdDate: string
  category: "discipline" | "attendance" | "conduct" | "cleanliness" | "co-curricular"
}
