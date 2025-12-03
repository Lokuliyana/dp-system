module.exports = {
  SECTION: {
    CREATE: 'section:create',
    READ: 'section:read',
    UPDATE: 'section:update',
    DELETE: 'section:delete',
  },
  GRADE: {
    CREATE: 'grade:create',
    READ: 'grade:read',
    UPDATE: 'grade:update',
    DELETE: 'grade:delete',
  },
  STUDENT: {
    CREATE: 'student:create',
    READ: 'student:read',
    UPDATE: 'student:update',
    DELETE: 'student:delete',
  },
  HOUSE: {
    CREATE: 'house:create',
    READ: 'house:read',
    UPDATE: 'house:update',
    DELETE: 'house:delete',
  },
  SQUAD: {
    CREATE: 'squad:create',
    READ: 'squad:read',
    UPDATE: 'squad:update',
    DELETE: 'squad:delete',
  },
  COMPETITION: {
    CREATE: 'competition:create',
    READ: 'competition:read',
    UPDATE: 'competition:update',
    DELETE: 'competition:delete',
  },
  COMPETITION_HOUSE_RULE: {
    UPSERT: 'competitionHouseRule:upsert',
    READ: 'competitionHouseRule:read',
  },
  COMPETITION_REGISTRATION: {
    CREATE: 'competitionRegistration:create',
    READ: 'competitionRegistration:read',
    DELETE: 'competitionRegistration:delete',
  },
  COMPETITION_TEAM: {
    CREATE: 'competitionTeam:create',
    READ: 'competitionTeam:read',
    UPDATE: 'competitionTeam:update',
    DELETE: 'competitionTeam:delete',
  },
  COMPETITION_RESULT: {
    RECORD: 'competitionResult:record',
    READ: 'competitionResult:read',
    DELETE: 'competitionResult:delete',
  },
  TEAM_SELECTION: {
    SAVE: 'teamSelection:save',
    READ: 'teamSelection:read',
  },
  GRADING_SCHEMA: {
    CREATE: 'gradingSchema:create',
    READ: 'gradingSchema:read',
    UPDATE: 'gradingSchema:update',
    DELETE: 'gradingSchema:delete',
  },
  EXAM_RESULT: {
    CREATE_SHEET: 'examResult:createSheet',
    UPSERT: 'examResult:upsert',
    READ: 'examResult:read',
  },
  TEACHER: {
    CREATE: 'teacher:create',
    READ: 'teacher:read',
    UPDATE: 'teacher:update',
    DELETE: 'teacher:delete',
  },
  STAFF_ROLE: {
    CREATE: 'staffRole:create',
    READ: 'staffRole:read',
    UPDATE: 'staffRole:update',
    DELETE: 'staffRole:delete',
  },
  CLUB_POSITION: {
    CREATE: 'clubPosition:create',
    READ: 'clubPosition:read',
    UPDATE: 'clubPosition:update',
    DELETE: 'clubPosition:delete',
  },
  CLUB: {
    CREATE: 'club:create',
    READ: 'club:read',
    UPDATE: 'club:update',
    DELETE: 'club:delete',
  },
  STUDENT_TALENT: {
    CREATE: 'studentTalent:create',
    READ: 'studentTalent:read',
    UPDATE: 'studentTalent:update',
    DELETE: 'studentTalent:delete',
  },
  STUDENT_HOUSE_ASSIGNMENT: {
    ASSIGN: 'studentHouseAssignment:assign',
    READ: 'studentHouseAssignment:read',
  },
  TEACHER_HOUSE_ASSIGNMENT: {
    ASSIGN: 'teacherHouseAssignment:assign',
    READ: 'teacherHouseAssignment:read',
  },
  PREFECT_POSITION: {
    CREATE: 'prefectPosition:create',
    READ: 'prefectPosition:read',
    UPDATE: 'prefectPosition:update',
    DELETE: 'prefectPosition:delete',
  },

  PREFECT: {
    CREATE_YEAR: 'prefect:createYear',
    READ: 'prefect:read',
    UPDATE: 'prefect:update',
  },
  EVENT: {
    CREATE: 'event:create',
    READ: 'event:read',
    UPDATE: 'event:update',
    DELETE: 'event:delete',
    REGISTER: 'event:register',
  },
  ATTENDANCE: {
    MARK: 'attendance:mark',
    READ: 'attendance:read',
    UPDATE: 'attendance:update',
    DELETE: 'attendance:delete',
  },
  PROMOTION: {
    TRIGGER: 'promotion:trigger',
  },

  PARENT: {
    CREATE: 'parent:create',
    READ: 'parent:read',
    UPDATE: 'parent:update',
    DELETE: 'parent:delete',
  },

  PARENT_STUDENT_LINK: {
    LINK: 'parentStudentLink:link',
    UPDATE: 'parentStudentLink:update',
    UNLINK: 'parentStudentLink:unlink',
  },

  APP_USER: {
    CREATE: 'appUser:create',
    READ: 'appUser:read',
    UPDATE: 'appUser:update',
    DELETE: 'appUser:delete',
  },

  // Add full set when implementing each module
}
