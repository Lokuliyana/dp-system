const router = require('express').Router()
const ctrl = require('../../controllers/housemeets/competitionRegistration.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/housemeets/competitionRegistration.validation')

router.post(
  '/',
  // permit([P.COMPETITION_REGISTRATION.CREATE]),
  validate(V.registerSchema),
  ctrl.registerStudent
)

router.get(
  '/',
  // permit([P.COMPETITION_REGISTRATION.READ]),
  validate(V.listSchema),
  ctrl.listRegistrations
)

router.delete(
  '/:id',
  // permit([P.COMPETITION_REGISTRATION.DELETE]),
  validate(V.deleteSchema),
  ctrl.deleteRegistration
)

module.exports = router
