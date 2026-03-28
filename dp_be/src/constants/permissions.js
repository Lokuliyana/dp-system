module.exports = {
  SECTION: {
    CREATE: 'system.section.create',
    READ: 'system.section.read',
    UPDATE: 'system.section.update',
    DELETE: 'system.section.delete',
  },
  GRADE: {
    CREATE: 'system.grade.create',
    READ: 'system.grade.read',
    UPDATE: 'system.grade.update',
    DELETE: 'system.grade.delete',
  },
  STUDENT: {
    CREATE: 'student.student.create',
    READ: 'student.student.read',
    UPDATE: 'student.student.update',
    DELETE: 'student.student.delete',
  },
  HOUSE: {
    CREATE: 'housemeets.house.create',
    READ: 'housemeets.house.read',
    UPDATE: 'housemeets.house.update',
    DELETE: 'housemeets.house.delete',
  },
  SQUAD: {
    CREATE: 'activities.squad.create',
    READ: 'activities.squad.read',
    UPDATE: 'activities.squad.update',
    DELETE: 'activities.squad.delete',
  },
  COMPETITION: {
    CREATE: 'housemeets.competition.create',
    READ: 'housemeets.competition.read',
    UPDATE: 'housemeets.competition.update',
    DELETE: 'housemeets.competition.delete',
  },
  COMPETITION_HOUSE_RULE: {
    UPSERT: 'housemeets.competition_house_rule.upsert',
    READ: 'housemeets.competition_house_rule.read',
  },
  COMPETITION_REGISTRATION: {
    CREATE: 'housemeets.competition_registration.create',
    READ: 'housemeets.competition_registration.read',
    DELETE: 'housemeets.competition_registration.delete',
  },
  COMPETITION_TEAM: {
    CREATE: 'housemeets.competition_team.create',
    READ: 'housemeets.competition_team.read',
    UPDATE: 'housemeets.competition_team.update',
    DELETE: 'housemeets.competition_team.delete',
  },
  COMPETITION_RESULT: {
    RECORD: 'housemeets.competition_result.create', // Mapping RECORD to create/update in JSON logic
    READ: 'housemeets.competition_result.read',
    DELETE: 'housemeets.competition_result.delete',
  },
  TEAM_SELECTION: {
    SAVE: 'housemeets.team_selection.update',
    READ: 'housemeets.team_selection.read',
  },
  GRADING_SCHEMA: {
    CREATE: 'system.grading_schema.create',
    READ: 'system.grading_schema.read',
    UPDATE: 'system.grading_schema.update',
    DELETE: 'system.grading_schema.delete',
  },
  EXAM_RESULT: {
    CREATE_SHEET: 'student.exam_result.create',
    UPSERT: 'student.exam_result.update',
    READ: 'student.exam_result.read',
  },
  TEACHER: {
    CREATE: 'staff.teacher.create',
    READ: 'staff.teacher.read',
    UPDATE: 'staff.teacher.update',
    DELETE: 'staff.teacher.delete',
  },
  STAFF_ROLE: {
    CREATE: 'staff.staff_role.create',
    READ: 'staff.staff_role.read',
    UPDATE: 'staff.staff_role.update',
    DELETE: 'staff.staff_role.delete',
  },
  CLUB_POSITION: {
    CREATE: 'activities.club_position.create',
    READ: 'activities.club_position.read',
    UPDATE: 'activities.club_position.update',
    DELETE: 'activities.club_position.delete',
  },
  CLUB: {
    CREATE: 'activities.club.create',
    READ: 'activities.club.read',
    UPDATE: 'activities.club.update',
    DELETE: 'activities.club.delete',
  },
  STUDENT_TALENT: {
    CREATE: 'student.student_talent.create',
    READ: 'student.student_talent.read',
    UPDATE: 'student.student_talent.update',
    DELETE: 'student.student_talent.delete',
  },
  STUDENT_HOUSE_ASSIGNMENT: {
    ASSIGN: 'housemeets.student_house_assignment.create',
    READ: 'housemeets.student_house_assignment.read',
  },
  TEACHER_HOUSE_ASSIGNMENT: {
    ASSIGN: 'housemeets.teacher_house_assignment.create',
    READ: 'housemeets.teacher_house_assignment.read',
  },
  PREFECT_POSITION: {
    CREATE: 'staff.prefect_position.create',
    READ: 'staff.prefect_position.read',
    UPDATE: 'staff.prefect_position.update',
    DELETE: 'staff.prefect_position.delete',
  },

  PREFECT: {
    CREATE_YEAR: 'staff.prefect.create',
    READ: 'staff.prefect.read',
    UPDATE: 'staff.prefect.update',
  },
  EVENT: {
    CREATE: 'activities.event.create',
    READ: 'activities.event.read',
    UPDATE: 'activities.event.update',
    DELETE: 'activities.event.delete',
    REGISTER: 'activities.event_registration.create',
  },
  ATTENDANCE: {
    MARK: 'student.attendance.create',
    READ: 'student.attendance.read',
    UPDATE: 'student.attendance.update',
    DELETE: 'student.attendance.delete',
  },
  PROMOTION: {
    TRIGGER: 'student.promotion.create',
  },

  PARENT: {
    CREATE: 'student.parent.create',
    READ: 'student.parent.read',
    UPDATE: 'student.parent.update',
    DELETE: 'student.parent.delete',
  },

  PARENT_STUDENT_LINK: {
    LINK: 'student.parent_student_link.create',
    UPDATE: 'student.parent_student_link.update',
    UNLINK: 'student.parent_student_link.delete',
  },

  APP_USER: {
    CREATE: 'system.app_user.create',
    READ: 'system.app_user.read',
    UPDATE: 'system.app_user.update',
    DELETE: 'system.app_user.delete',
  },
  ROLE: {
    CREATE: 'system.role.create',
    READ: 'system.role.read',
    UPDATE: 'system.role.update',
    DELETE: 'system.role.delete',
  },
  PERMISSION: {
    READ: 'system.permission.read',
  },
  ORGANIZATION_CALENDAR: {
    READ: 'system.school.read',
    UPDATE: 'system.school.update',
  },
  EXAM: {
    CREATE: 'student.exam_result.create',
    READ: 'student.exam_result.read',
    UPDATE_MARKS: 'student.exam_result.update',
  },
  REPORT: {
    READ: 'student.report.read',
    GENERATE: 'student.report.create',
  },
  ANALYTICS: {
    READ: 'student.report.read', // Assuming analytics maps to report in simple logic
  },

  // Add full set when implementing each module
}
