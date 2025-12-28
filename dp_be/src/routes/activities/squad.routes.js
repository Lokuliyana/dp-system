const router = require('express').Router()
const ctrl = require('../../controllers/activities/squad.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/activities/squad.validation')

router.post(
  '/',
  // permit([P.SQUAD.CREATE]),
  validate(V.createSquadSchema),
  ctrl.createSquad
)

router.get(
  '/',
  // permit([P.SQUAD.READ]),
  ctrl.listSquads
)

router.patch(
  '/:id',
  // permit([P.SQUAD.UPDATE]),
  validate(V.updateSquadSchema),
  ctrl.updateSquad
)

router.delete(
  '/:id',
  // permit([P.SQUAD.DELETE]),
  validate(V.deleteSquadSchema),
  ctrl.deleteSquad
)

module.exports = router
