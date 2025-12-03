const router = require('express').Router()
const ctrl = require('../controllers/prefect.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/prefect.validation')

router.post(
  '/',
  // permit([P.PREFECT.CREATE_YEAR]),
  validate(V.createPrefectYearSchema),
  ctrl.createPrefectYear
)

router.get(
  '/',
  // permit([P.PREFECT.READ]),
  validate(V.listPrefectsSchema),
  ctrl.listPrefects
)

router.post(
  '/:id/students',
  // permit([P.PREFECT.UPDATE]),
  validate(V.addPrefectStudentSchema),
  ctrl.addPrefectStudent
)

router.patch(
  '/:id/students/:studentId',
  // permit([P.PREFECT.UPDATE]),
  validate(V.updatePrefectStudentSchema),
  ctrl.updatePrefectStudent
)

router.delete(
  '/:id/students/:studentId',
  // permit([P.PREFECT.UPDATE]),
  validate(V.removePrefectStudentSchema),
  ctrl.removePrefectStudent
)

module.exports = router
