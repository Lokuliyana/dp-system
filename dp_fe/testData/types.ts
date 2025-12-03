export type House = "meththa" | "karuna" | "muditha" | "upekka"

export type StudentStatus = "active" | "inactive" | "transferred" | "graduated"
export type AcademicPerformance = "excellent" | "good" | "average" | "needs-improvement"
export type TalentCategory = "academic" | "sports" | "arts" | "leadership" | "other"
export type TalentLevel = "beginner" | "intermediate" | "advanced" | "expert"
export type NoteCategory = "academic" | "behavioral" | "health" | "personal" | "achievement"
export type AttendanceStatus = "present" | "absent" | "marked-absent"

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

export type TeacherStatus = "active" | "inactive" | "on-leave"
export type TeacherResponsibilityCategory = "academic" | "administrative" | "discipline" | "co-curricular"

export type PrefectRank = "prefect" | "vice-prefect" | "head-prefect"
export type PrefectResponsibilityCategory = "discipline" | "attendance" | "conduct" | "cleanliness" | "co-curricular"

export type ClubCategory =
  | "academic"
  | "sports"
  | "arts"
  | "music"
  | "environmental"
  | "social-service"
  | "technology"
  | "debate"
export type ClubMemberRole = "member" | "president" | "vice-president" | "secretary"
export type ClubStatus = "active" | "inactive"

export type CompetitionCategory =
  | "dharma-knowledge-junior"
  | "dharma-knowledge-senior"
  | "singing-junior"
  | "singing-senior"
  | "writing"
  | "oratory"
  | "primary-art"
  | "primary-singing"
  | "junior-art"
  | "junior-singing"
  | "senior-art"
  | "senior-singing"

export type Place = 1 | 2 | 3 | 4 | 5

// Core Models
export interface Grade {
  id: string
  name: string
  level: number
  section: string
  totalStrength: number
  classTeacher: string
}

export interface Talent {
  id: string
  name: string
  category: TalentCategory
  level: TalentLevel
  description: string
}

export interface StudentNote {
  id: string
  date: string
  title: string
  content: string
  category: NoteCategory
  author: string
  isPrivate: boolean
}

export interface Student {
  id: string
  gradeId: string
  rollNumber: number
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  enrollmentDate: string
  parentName: string
  parentPhone: string
  address: string
  status: StudentStatus
  academicPerformance: AcademicPerformance
  talents: Talent[]
  notes: StudentNote[]
  phoneNumber: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: AttendanceStatus
  notes?: string
}

export interface StudentMarks {
  id: string
  studentId: string
  subject: string
  marks: number
  totalMarks: number
  percentage: number
  grade: string
  testDate: string
  testName: string
}

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
  responsibilities: string[]
  status: TeacherStatus
}

export interface TeacherResponsibility {
  id: string
  title: string
  description: string
  createdDate: string
  category: TeacherResponsibilityCategory
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
  responsibilities: string[]
}

export interface PrefectResponsibility {
  id: string
  title: string
  description: string
  createdDate: string
  category: PrefectResponsibilityCategory
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
  status: ClubStatus
}

export interface ClubMembership {
  id: string
  studentId: string
  firstName: string
  lastName: string
  gradeId: string
  clubId: string
  role: ClubMemberRole
  joinedDate: string
}

export interface HouseAssignment {
  studentId: string
  house: House
  assignedDate: string
  year: number
}

export interface CompetitionRegistration {
  id: string
  studentId: string
  firstName: string
  lastName: string
  gradeId: string
  category: CompetitionCategory
  house?: House
  registeredDate: string
  year: number
}

export interface CompetitionResult {
  id: string
  registrationId: string
  studentId: string
  firstName: string
  lastName: string
  house?: House
  place: Place
  category: CompetitionCategory
  gradeId: string
  year: number
  resultDate: string
}
