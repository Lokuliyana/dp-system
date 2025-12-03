const router = require('express').Router()
const ctrl = require('../controllers/prefectPosition.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/prefectPosition.validation')

router.post(
  '/',
  // permit([P.PREFECT_POSITION.CREATE]),
  validate(V.createPrefectPositionSchema),
  ctrl.createPrefectPosition
)

router.get(
  '/',
  // permit([P.PREFECT_POSITION.READ]),
  ctrl.listPrefectPositions
)

router.patch(
  '/:id',
  // permit([P.PREFECT_POSITION.UPDATE]),
  validate(V.updatePrefectPositionSchema),
  ctrl.updatePrefectPosition
)

router.delete(
  '/:id',
  // permit([P.PREFECT_POSITION.DELETE]),
  validate(V.deletePrefectPositionSchema),
  ctrl.deletePrefectPosition
)

module.exports = router
