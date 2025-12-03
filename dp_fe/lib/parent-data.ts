import type { ParentContact } from "./competition-data"

export function generateSampleParents(): ParentContact[] {
  const occupations = [
    "Engineer",
    "Doctor",
    "Teacher",
    "Lawyer",
    "Business Owner",
    "Accountant",
    "Architect",
    "Healthcare Worker",
    "IT Professional",
    "Entrepreneur",
  ]

  const parents: ParentContact[] = [
    {
      id: "parent-1",
      firstName: "Samantha",
      lastName: "Williams",
      email: "samantha.w@email.com",
      phone: "+94-77-001-0001",
      occupation: "Engineer",
      relationship: "mother",
      students: ["grade-1-student-1", "grade-2-student-5"],
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      id: "parent-2",
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.j@email.com",
      phone: "+94-77-002-0002",
      occupation: "Doctor",
      relationship: "father",
      students: ["grade-3-student-8"],
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      id: "parent-3",
      firstName: "Priya",
      lastName: "Kumar",
      email: "priya.k@email.com",
      phone: "+94-77-003-0003",
      occupation: "Business Owner",
      relationship: "mother",
      students: ["grade-5-student-12"],
      lastUpdated: new Date().toISOString().split("T")[0],
    },
  ]

  return parents
}
