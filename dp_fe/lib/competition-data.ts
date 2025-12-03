export type GradeGroup = "primary" | "secondary"

export interface Competition {
  id: string
  name: string
  description: string
  gradeGroup: GradeGroup // primary (1-6) or secondary (7-13)
  category: string
  startDate: string
  endDate: string
  status: "upcoming" | "ongoing" | "completed"
  maxParticipants?: number
  location?: string
}

export interface CompetitionRegistration {
  id: string
  competitionId: string
  studentId: string
  firstName: string
  lastName: string
  gradeId: string
  gradeLevel: number
  registrationDate: string
  status: "registered" | "completed" | "withdrawn"
}

export interface CompetitionResult {
  id: string
  competitionId: string
  registrationId: string
  studentId: string
  firstName: string
  lastName: string
  gradeId: string
  position: number // 1st, 2nd, 3rd place, etc.
  points?: number
  resultDate: string
  notes?: string
}

export interface ParentContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  occupation: string
  relationship: "mother" | "father" | "guardian" | "relative"
  students: string[] // Student IDs this parent is responsible for
  notes?: string
  lastUpdated: string
}

export const COMPETITIONS_PRIMARY: Competition[] = [
  {
    id: "comp-1",
    name: "Class Recitation",
    description: "Sacred text recitation for grades 1-6",
    gradeGroup: "primary",
    category: "academic",
    startDate: "2025-03-01",
    endDate: "2025-03-15",
    status: "upcoming",
    maxParticipants: 15,
  },
  {
    id: "comp-2",
    name: "Art & Craft Exhibition",
    description: "Creative artwork from primary students",
    gradeGroup: "primary",
    category: "arts",
    startDate: "2025-03-20",
    endDate: "2025-04-05",
    status: "upcoming",
  },
  {
    id: "comp-3",
    name: "Sports Day",
    description: "Athletics and team sports for grades 1-6",
    gradeGroup: "primary",
    category: "sports",
    startDate: "2025-05-01",
    endDate: "2025-05-01",
    status: "upcoming",
  },
]

export const COMPETITIONS_SECONDARY: Competition[] = [
  {
    id: "comp-4",
    name: "Debate Competition",
    description: "Inter-grade debate for grades 7-13",
    gradeGroup: "secondary",
    category: "academic",
    startDate: "2025-04-01",
    endDate: "2025-04-20",
    status: "upcoming",
    maxParticipants: 20,
  },
  {
    id: "comp-5",
    name: "Science Fair",
    description: "Science projects and demonstrations",
    gradeGroup: "secondary",
    category: "academic",
    startDate: "2025-05-10",
    endDate: "2025-05-25",
    status: "upcoming",
  },
  {
    id: "comp-6",
    name: "Band Competition",
    description: "Music performance for senior students",
    gradeGroup: "secondary",
    category: "arts",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    status: "upcoming",
  },
]
