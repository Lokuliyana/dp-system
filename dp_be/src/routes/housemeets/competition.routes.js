const router = require('express').Router()
const ctrl = require('../../controllers/housemeets/competition.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/housemeets/competition.validation')

router.post(
  '/',
  // permit([P.COMPETITION.CREATE]),
  validate(V.createCompetitionSchema),
  ctrl.createCompetition
)

router.get(
  '/',
  // permit([P.COMPETITION.READ]),
  validate(V.listCompetitionsSchema),
  ctrl.listCompetitions
)

router.patch(
  '/:id',
  // permit([P.COMPETITION.UPDATE]),
  validate(V.updateCompetitionSchema),
  ctrl.updateCompetition
)

router.delete(
  '/:id',
  // permit([P.COMPETITION.DELETE]),
  validate(V.deleteCompetitionSchema),
  ctrl.deleteCompetition
)

module.exports = router
