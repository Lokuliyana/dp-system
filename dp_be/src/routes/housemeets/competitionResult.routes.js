const router = require('express').Router()
const ctrl = require('../../controllers/housemeets/competitionResult.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/housemeets/competitionResult.validation')

router.post(
  '/',
  // permit([P.COMPETITION_RESULT.RECORD]),
  validate(V.recordResultsSchema),
  ctrl.recordResults
)

router.get(
  '/',
  // permit([P.COMPETITION_RESULT.READ]),
  validate(V.listResultsSchema),
  ctrl.listResults
)

router.delete(
  '/:id',
  // permit([P.COMPETITION_RESULT.DELETE]),
  validate(V.removeResultSchema),
  ctrl.removeResultEntry
)

// derived endpoint for F14 leaderboard
router.get(
  '/house-points',
  // permit([P.COMPETITION_RESULT.READ]),
  validate(V.computeHousePointsSchema),
  ctrl.computeHousePoints
)

module.exports = router
