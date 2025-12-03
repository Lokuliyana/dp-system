const router = require('express').Router()
const ctrl = require('../controllers/teacher.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/teacher.validation')

router.post(
  '/',
  // permit([P.TEACHER.CREATE]),
  validate(V.createTeacherSchema),
  ctrl.createTeacher
)

router.get(
  '/',
  // permit([P.TEACHER.READ]),
  validate(V.listTeachersSchema),
  ctrl.listTeachers
)

router.patch(
  '/:id',
  // permit([P.TEACHER.UPDATE]),
  validate(V.updateTeacherSchema),
  ctrl.updateTeacher
)

router.delete(
  '/:id',
  // permit([P.TEACHER.DELETE]),
  validate(V.deleteTeacherSchema),
  ctrl.deleteTeacher
)

router.post(
  '/:id/past-roles',
  // permit([P.TEACHER.UPDATE]),
  validate(V.appendPastRoleSchema),
  ctrl.appendPastRole
)

module.exports = router
