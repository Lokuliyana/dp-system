const ROLES = require('./roles')
const P = require('./permissions')

module.exports = {
  [ROLES.SUPER_ADMIN]: ['*'],

  [ROLES.SCHOOL_ADMIN]: [
    ...Object.values(P.SECTION),
    ...Object.values(P.GRADE),
    ...Object.values(P.HOUSE),
    ...Object.values(P.STUDENT),
    ...Object.values(P.SQUAD),
    ...Object.values(P.COMPETITION),
    ...Object.values(P.COMPETITION_HOUSE_RULE),
    ...Object.values(P.COMPETITION_REGISTRATION),
    ...Object.values(P.COMPETITION_TEAM),
    ...Object.values(P.COMPETITION_RESULT),
    ...Object.values(P.TEAM_SELECTION),
    ...Object.values(P.GRADING_SCHEMA),
    ...Object.values(P.EXAM_RESULT),
    ...Object.values(P.TEACHER),
    ...Object.values(P.STAFF_ROLE),
    ...Object.values(P.CLUB_POSITION),
    ...Object.values(P.CLUB),
    ...Object.values(P.STUDENT),
    ...Object.values(P.STUDENT_TALENT),
    ...Object.values(P.STUDENT_HOUSE_ASSIGNMENT),
    ...Object.values(P.TEACHER_HOUSE_ASSIGNMENT),
    ...Object.values(P.PREFECT_POSITION),
    ...Object.values(P.PREFECT),
    ...Object.values(P.EVENT),
    ...Object.values(P.ATTENDANCE),
    ...Object.values(P.PROMOTION),
    ...Object.values(P.PARENT),
    ...Object.values(P.PARENT_STUDENT_LINK),
    ...Object.values(P.APP_USER),
  ],

  [ROLES.GRADE_TEACHER]: [P.STUDENT.READ, P.GRADE.READ],

  [ROLES.READ_ONLY]: [P.SECTION.READ, P.GRADE.READ, P.STUDENT.READ],
}
