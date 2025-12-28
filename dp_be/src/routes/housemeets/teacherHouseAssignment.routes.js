const router = require('express').Router()
const ctrl = require('../../controllers/housemeets/teacherHouseAssignment.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/housemeets/teacherHouseAssignment.validation')

router.post(
  '/',
  // permit([P.TEACHER_HOUSE_ASSIGNMENT.ASSIGN]),
  validate(V.assignTeacherHouseSchema),
  ctrl.assignTeacherHouse
)

router.get(
  '/',
  // permit([P.TEACHER_HOUSE_ASSIGNMENT.READ]),
  validate(V.listTeacherHouseAssignmentsSchema),
  ctrl.listTeacherHouseAssignments
)

module.exports = router
