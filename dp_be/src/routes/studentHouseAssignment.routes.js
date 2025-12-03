const router = require('express').Router()
const ctrl = require('../controllers/studentHouseAssignment.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/studentHouseAssignment.validation')

router.post(
  '/',
  // permit([P.STUDENT_HOUSE_ASSIGNMENT.ASSIGN]),
  validate(V.assignStudentHouseSchema),
  ctrl.assignStudentHouse
)

router.delete(
  '/:studentId',
  // permit([P.STUDENT_HOUSE_ASSIGNMENT.ASSIGN]),
  // validate(V.removeStudentHouseSchema), // TODO: Add validation if needed
  ctrl.removeStudentHouse
)

router.post(
  '/bulk',
  // permit([P.STUDENT_HOUSE_ASSIGNMENT.ASSIGN]),
  // validate(V.bulkAssignStudentHouseSchema), // TODO: Add validation
  ctrl.bulkAssignStudentHouse
)

router.get(
  '/',
  // permit([P.STUDENT_HOUSE_ASSIGNMENT.READ]),
  validate(V.listHouseAssignmentsSchema),
  ctrl.listHouseAssignments
)

module.exports = router
