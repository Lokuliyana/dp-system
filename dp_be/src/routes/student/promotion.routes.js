const router = require('express').Router()
const ctrl = require('../../controllers/student/promotion.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/student/promotion.validation')

// Manual trigger (admin only). Actual yearly run will be via cron job.
router.post(
  '/trigger',
  // permit([P.PROMOTION.TRIGGER]),
  validate(V.triggerPromotionSchema),
  ctrl.triggerPromotion
)

module.exports = router
