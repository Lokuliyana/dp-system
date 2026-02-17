/**
 * Query Keys for React Query (TanStack)
 * -------------------------------------
 * Every key is stable, predictable, and typed.
 * This prevents accidental duplication and ensures perfect cache invalidation.
 *
 * Pattern:
 *   qk.moduleName(parameter...) => ["moduleName", ...parameters]
 *
 * Usage:
 *   useQuery({ queryKey: qk.students.byGrade(gradeId, year), ... })
 */

export const qk = {
  /* -------------------- AUTH / USERS -------------------- */
  auth: {
    me: ["auth", "me"] as const,
    users: ["auth", "users"] as const,
  },

  /* -------------------- GRADES / SECTIONS / HOUSES -------------------- */
  grades: {
    all: ["grades", "all"] as const,
  },

  sections: {
    all: ["sections", "all"] as const,
  },

  houses: {
    all: ["houses", "all"] as const,
  },

  squads: {
    all: ["squads", "all"] as const,
  },

  /* -------------------- GRADING SCHEMAS -------------------- */
  gradingSchemas: {
    all: ["gradingSchemas", "all"] as const,
    byId: (id: string) => ["gradingSchemas", id] as const,
  },

  /* -------------------- TEACHERS -------------------- */
  teachers: {
    all: ["teachers", "all"] as const,
    list: (params?: any) => ["teachers", "list", params] as const,
    detail: (id: string) => ["teachers", "detail", id] as const,
  },

  staffRoles: {
    all: ["staffRoles", "all"] as const,
  },

  /* -------------------- CLUBS & POSITIONS -------------------- */
  clubPositions: {
    all: ["clubPositions", "all"] as const,
  },

  clubs: {
    all: ["clubs", "all"] as const,
    byId: (id: string) => ["clubs", id] as const,
  },

  /* -------------------- STUDENTS -------------------- */
  students: {
    all: ["students", "all"] as const,

    byGrade: (gradeId: string, year?: number, status?: string, sex?: string) =>
      ["students", "grade", gradeId, year, status, sex] as const,

    byId: (id: string) => ["students", id] as const,

    notes: (studentId: string) => ["students", studentId, "notes"] as const,

    view360: (studentId: string, year?: number) =>
      ["students", studentId, "360", year] as const,
  },

  studentTalents: {
    all: ["studentTalents", "all"] as const,
    byStudent: (studentId: string) =>
      ["studentTalents", "student", studentId] as const,
  },

  studentHouseAssignments: {
    all: ["studentHouseAssignments", "all"] as const,
    byStudent: (studentId: string) =>
      ["studentHouseAssignments", "student", studentId] as const,
    list: (filters: Record<string, any>) =>
      ["studentHouseAssignments", "list", filters] as const,
  },

  /* -------------------- PARENTS -------------------- */
  parents: {
    all: ["parents", "all"] as const,
    search: (q?: string) => ["parents", "search", q] as const,
    byId: (id: string) => ["parents", id] as const,
  },

  parentStudentLinks: {
    byStudent: (studentId: string) =>
      ["parentStudentLinks", "student", studentId] as const,

    byParent: (parentId: string) =>
      ["parentStudentLinks", "parent", parentId] as const,
  },

  /* -------------------- COMPETITIONS -------------------- */
  competitions: {
    all: ["competitions", "all"] as const,
    byYear: (year?: number) => ["competitions", "year", year] as const,
    byId: (id: string) => ["competitions", id] as const,
  },

  competitionRules: {
    byCompetition: (competitionId: string, year?: number) =>
      ["competitionRules", competitionId, year] as const,
  },

  competitionRegistrations: {
    list: (filters: Record<string, any>) =>
      ["competitionRegistrations", filters] as const,
  },

  competitionTeams: {
    byCompetition: (competitionId: string, year?: number) =>
      ["competitionTeams", competitionId, year] as const,
  },

  competitionResults: {
    byCompetition: (competitionId: string, year?: number) =>
      ["competitionResults", competitionId, year] as const,
  },

  teamSelections: {
    byYear: (year: number) => ["teamSelections", year] as const,
  },

  teacherHouseAssignments: {
    list: (filters?: Record<string, any>) => ["teacherHouseAssignments", filters] as const,
  },

  /* -------------------- PREFECTS -------------------- */
  prefectPositions: {
    all: ["prefectPositions", "all"] as const,
  },

  prefects: {
    all: ["prefects", "all"] as const,
    list: (year?: number) => ["prefects", "list", year] as const,
    students: (prefectId: string) =>
      ["prefects", prefectId, "students"] as const,
  },

  /* -------------------- EVENTS -------------------- */
  events: {
    all: ["events", "all"] as const,
    byYear: (year?: number) => ["events", "year", year] as const,
    byId: (id: string) => ["events", id] as const,
  },

  eventRegistrations: {
    byEvent: (eventId: string) => ["eventRegistrations", eventId] as const,
  },

  /* -------------------- ATTENDANCE -------------------- */
  attendance: {
    byDate: (date: string, gradeId?: string) =>
      ["attendance", "date", date, gradeId] as const,

    byStudent: (studentId: string) =>
      ["attendance", "student", studentId] as const,
  },

  examResults: {
    byStudent: (studentId: string) =>
      ["examResults", "student", studentId] as const,
    byGrade: (gradeId: string) => ["examResults", "grade", gradeId] as const,
  },

  /* -------------------- PROMOTION -------------------- */
  promotion: {
    status: ["promotion", "status"] as const,
  },
} as const;
