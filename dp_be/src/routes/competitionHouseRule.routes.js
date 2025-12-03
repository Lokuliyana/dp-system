const router = require('express').Router()
const ctrl = require('../controllers/competitionHouseRule.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/competitionHouseRule.validation')

// Upsert (create or update rule)
router.put(
  '/',
  // permit([P.COMPETITION_HOUSE_RULE.UPSERT]),
  validate(V.upsertHouseRuleSchema),
  ctrl.upsertHouseRule
)

// Get rule for comp/year (returns default if none)
router.get(
  '/',
  // permit([P.COMPETITION_HOUSE_RULE.READ]),
  validate(V.getHouseRuleSchema),
  ctrl.getHouseRule
)

module.exports = router
