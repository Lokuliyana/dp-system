export type House = "meththa" | "karuna" | "muditha" | "upekka"

export type CompetitionMethod = "dhamma-knowledge" | "singing" | "art" | "oratory" | "writing" | "song-singing"

export type CompetitionCategory =
  | "dhamma-knowledge-primary"
  | "dhamma-knowledge-junior"
  | "dhamma-knowledge-senior"
  | "singing-primary"
  | "singing-junior"
  | "singing-senior"
  | "art-primary"
  | "art-junior"
  | "art-senior"
  | "oratory-junior"
  | "oratory-senior"
  | "writing-junior"
  | "writing-senior"
  | "song-singing-primary"
  | "song-singing-junior"
  | "song-singing-senior"

export type Place = 1 | 2 | 3 | 4 | 5

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

export interface HouseMeetYear {
  year: number
  registrations: CompetitionRegistration[]
  results: CompetitionResult[]
}

export const HOUSES: { value: House; label: string; color: string; bgColor: string }[] = [
  { value: "meththa", label: "Meththa", color: "text-red-600", bgColor: "bg-red-50" },
  { value: "karuna", label: "Karuna", color: "text-blue-600", bgColor: "bg-blue-50" },
  { value: "muditha", label: "Muditha", color: "text-green-600", bgColor: "bg-green-50" },
  { value: "upekka", label: "Upekka", color: "text-yellow-600", bgColor: "bg-yellow-50" },
]

export const COMPETITION_METHODS: { value: CompetitionMethod; label: string; description: string }[] = [
  { value: "dhamma-knowledge", label: "Dhamma Knowledge", description: "Buddhist spiritual knowledge and teachings" },
  { value: "singing", label: "Singing", description: "Solo vocal performance" },
  { value: "art", label: "Art", description: "Visual arts and creative expression" },
  { value: "oratory", label: "Oratory", description: "Public speaking and debate" },
  { value: "writing", label: "Writing", description: "Literary and creative writing" },
  { value: "song-singing", label: "Song Singing", description: "Group or solo song performance" },
]

export const COMPETITION_CATEGORIES: {
  value: CompetitionCategory
  label: string
  method: CompetitionMethod
  section: "primary" | "junior" | "senior"
  grades: number[]
}[] = [
  // Dhamma Knowledge
  {
    value: "dhamma-knowledge-primary",
    label: "Dhamma Knowledge",
    method: "dhamma-knowledge",
    section: "primary",
    grades: [1, 2, 3, 4, 5, 6],
  },
  {
    value: "dhamma-knowledge-junior",
    label: "Dhamma Knowledge",
    method: "dhamma-knowledge",
    section: "junior",
    grades: [7, 8, 9],
  },
  {
    value: "dhamma-knowledge-senior",
    label: "Dhamma Knowledge",
    method: "dhamma-knowledge",
    section: "senior",
    grades: [10, 11, 12, 13, 14],
  },
  // Singing
  {
    value: "singing-primary",
    label: "Singing",
    method: "singing",
    section: "primary",
    grades: [1, 2, 3, 4, 5, 6],
  },
  {
    value: "singing-junior",
    label: "Singing",
    method: "singing",
    section: "junior",
    grades: [7, 8, 9],
  },
  {
    value: "singing-senior",
    label: "Singing",
    method: "singing",
    section: "senior",
    grades: [10, 11, 12, 13, 14],
  },
  // Art
  {
    value: "art-primary",
    label: "Art",
    method: "art",
    section: "primary",
    grades: [1, 2, 3, 4, 5, 6],
  },
  {
    value: "art-junior",
    label: "Art",
    method: "art",
    section: "junior",
    grades: [7, 8, 9],
  },
  {
    value: "art-senior",
    label: "Art",
    method: "art",
    section: "senior",
    grades: [10, 11, 12, 13, 14],
  },
  // Oratory
  {
    value: "oratory-junior",
    label: "Oratory",
    method: "oratory",
    section: "junior",
    grades: [7, 8, 9],
  },
  {
    value: "oratory-senior",
    label: "Oratory",
    method: "oratory",
    section: "senior",
    grades: [10, 11, 12, 13, 14],
  },
  // Writing
  {
    value: "writing-junior",
    label: "Writing",
    method: "writing",
    section: "junior",
    grades: [7, 8, 9],
  },
  {
    value: "writing-senior",
    label: "Writing",
    method: "writing",
    section: "senior",
    grades: [10, 11, 12, 13, 14],
  },
  // Song Singing
  {
    value: "song-singing-primary",
    label: "Song Singing",
    method: "song-singing",
    section: "primary",
    grades: [1, 2, 3, 4, 5, 6],
  },
  {
    value: "song-singing-junior",
    label: "Song Singing",
    method: "song-singing",
    section: "junior",
    grades: [7, 8, 9],
  },
  {
    value: "song-singing-senior",
    label: "Song Singing",
    method: "song-singing",
    section: "senior",
    grades: [10, 11, 12, 13, 14],
  },
]

export function getHouseLabel(house: House): string {
  return HOUSES.find((h) => h.value === house)?.label || house
}

export function getHouseColor(house: House): string {
  return HOUSES.find((h) => h.value === house)?.color || "text-slate-600"
}

export function getHouseBgColor(house: House): string {
  return HOUSES.find((h) => h.value === house)?.bgColor || "bg-slate-50"
}

export function getCategoriesByMethod(method: CompetitionMethod): typeof COMPETITION_CATEGORIES {
  return COMPETITION_CATEGORIES.filter((c) => c.method === method)
}

export function getSectionLabel(section: "primary" | "junior" | "senior"): string {
  return { primary: "Primary (Grades 1-6)", junior: "Junior (Grades 7-9)", senior: "Senior (Grades 10-14)" }[section]
}

export function getStudentSection(gradeLevel: number): "primary" | "junior" | "senior" | null {
  if (gradeLevel >= 1 && gradeLevel <= 6) return "primary"
  if (gradeLevel >= 7 && gradeLevel <= 9) return "junior"
  if (gradeLevel >= 10 && gradeLevel <= 14) return "senior"
  return null
}
export const PLACES: { value: Place; label: string; points: number }[] = [
  { value: 1, label: "1st Place", points: 10 },
  { value: 2, label: "2nd Place", points: 7 },
  { value: 3, label: "3rd Place", points: 5 },
  { value: 4, label: "4th Place", points: 3 },
  { value: 5, label: "5th Place", points: 1 },
]
