import type { Teacher, TeacherResponsibility } from "./types"

export const SAMPLE_TEACHERS: Teacher[] = [
  {
    id: "teacher-1",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh@school.edu",
    phone: "+94-77-123-4567",
    qualification: "B.Sc Mathematics, M.Ed",
    experience: 8,
    joiningDate: "2016-01-15",
    department: "Mathematics",
    positions: ["class-teacher", "subject-coordinator"],
    squads: ["Curriculum", "Examination"],
    responsibilities: ["tresp-1", "tresp-2"],
    status: "active",
  },
  {
    id: "teacher-2",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya@school.edu",
    phone: "+94-77-234-5678",
    qualification: "B.A English, M.Ed",
    experience: 6,
    joiningDate: "2018-06-01",
    department: "English",
    positions: ["house-master"],
    squads: ["Cultural", "Co-Curricular"],
    responsibilities: ["tresp-3", "tresp-4"],
    status: "active",
  },
]

export const SAMPLE_TEACHER_RESPONSIBILITIES: TeacherResponsibility[] = [
  {
    id: "tresp-1",
    title: "Morning Assembly Supervision",
    description: "Monitor and manage morning assembly activities",
    createdDate: new Date().toISOString().split("T")[0],
    category: "administrative",
  },
  {
    id: "tresp-2",
    title: "Exam Invigilation",
    description: "Invigilate periodic and final exams",
    createdDate: new Date().toISOString().split("T")[0],
    category: "academic",
  },
  {
    id: "tresp-3",
    title: "Discipline Committee",
    description: "Handle discipline cases and student conduct",
    createdDate: new Date().toISOString().split("T")[0],
    category: "discipline",
  },
  {
    id: "tresp-4",
    title: "Sports Day Coordination",
    description: "Organize and coordinate sports events",
    createdDate: new Date().toISOString().split("T")[0],
    category: "co-curricular",
  },
]
