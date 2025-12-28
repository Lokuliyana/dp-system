const router = require('express').Router()
const ctrl = require('../../controllers/system/grade.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/system/grade.validation')

router.post(
  '/',
  // permit([P.GRADE.CREATE]),
  validate(V.createGradeSchema),
  ctrl.createGrade
)

router.get(
  '/',
  // permit([P.GRADE.READ]),
  validate(V.listGradesSchema),
  ctrl.listGradesWithStats
)

router.patch(
  '/:id',
  // permit([P.GRADE.UPDATE]),
  validate(V.updateGradeSchema),
  ctrl.updateGrade
)

router.delete(
  '/:id',
  // permit([P.GRADE.DELETE]),
  validate(V.deleteGradeSchema),
  ctrl.deleteGrade
)

module.exports = router
