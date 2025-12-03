const router = require('express').Router()
const ctrl = require('../controllers/teamSelection.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/teamSelection.validation')

// F21 suggestions
router.get(
  '/zonal-suggestions',
  // permit([P.TEAM_SELECTION.READ]),
  validate(V.getZonalSuggestionsSchema),
  ctrl.getZonalSuggestions
)

// Save selection for any level (F21/F22)
router.post(
  '/',
  // permit([P.TEAM_SELECTION.SAVE]),
  validate(V.saveSelectionSchema),
  ctrl.saveTeamSelection
)

// Get selection
router.get(
  '/',
  // permit([P.TEAM_SELECTION.READ]),
  validate(V.getSelectionSchema),
  ctrl.getSelection
)

// F22 recompute totals if needed
router.post(
  '/compute-total',
  // permit([P.TEAM_SELECTION.SAVE]),
  validate(V.saveSelectionSchema.pick({ body: true })),
  ctrl.computeTeamTotalMarks
)

// F23/F24 auto generate next level
router.post(
  '/auto-generate',
  // permit([P.TEAM_SELECTION.SAVE]),
  validate(V.autoGenerateSchema),
  ctrl.autoGenerateNextLevel
)

module.exports = router
