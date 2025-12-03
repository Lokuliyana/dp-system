export const endpoints = {
  auth: {
    login: "/app-users/login",
    refresh: "/app-users/refresh",
    users: "/app-users",
  },

  sections: "/sections",
  grades: "/grades",
  houses: "/houses",
  squads: "/squads",
  gradingSchemas: "/grading-schemas",

  teachers: "/teachers",
  staffRoles: "/staff-roles",

  students: "/students",
  studentTalents: "/student-talents",
  studentHouseAssignments: "/student-house-assignments",

  parents: "/parents",
  parentStudentLinks: "/parent-student-links",

  clubPositions: "/club-positions",
  clubs: "/clubs",
  teacherHouseAssignments: "/teacher-house-assignments",

  competitions: "/competitions",
  competitionRules: "/competition-house-rules",
  competitionRegistrations: "/competition-registrations",
  competitionTeams: "/competition-teams",
  competitionResults: "/competition-results",
  teamSelections: "/team-selections",

  prefectPositions: "/prefect-positions",
  prefects: "/prefects",

  events: "/events",
  attendance: "/attendance",
  
  reports: {
    student: "/reports/student",
    grade: "/reports/grade",
    teacher: "/reports/teacher",
    house: "/reports/house",
    teams: "/reports/teams",
  },

  examResults: "/exam-results", 

  promotion: "/promotion/trigger",
} as const;
