const router = require('express').Router()
const ctrl = require('../controllers/gradingSchema.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/gradingSchema.validation')

router.post(
  '/',
  // permit([P.GRADING_SCHEMA.CREATE]),
  validate(V.createGradingSchema),
  ctrl.createGradingSchema
)

router.get(
  '/',
  // permit([P.GRADING_SCHEMA.READ]),
  ctrl.listGradingSchemas
)

router.patch(
  '/:id',
  // permit([P.GRADING_SCHEMA.UPDATE]),
  validate(V.updateGradingSchema),
  ctrl.updateGradingSchema
)

router.delete(
  '/:id',
  // permit([P.GRADING_SCHEMA.DELETE]),
  validate(V.deleteGradingSchema),
  ctrl.deleteGradingSchema
)

module.exports = router
