const cron = require('node-cron')
const env = require('../config/env')
const promotionService = require('../services/student/promotion.service')
const logger = require('../config/logger')

/**
 * Runs yearly based on env.PROMOTION_CRON.
 * You must pass a system userId (env.SYSTEM_USER_ID) to keep audit trail.
 */
exports.registerPromotionJob = () => {
  if (!env.PROMOTION_CRON) return

  cron.schedule(env.PROMOTION_CRON, async () => {
    try {
      const fromYear = Number(env.PROMOTION_FROM_YEAR)
      const toYear = Number(env.PROMOTION_TO_YEAR)

      if (!fromYear || !toYear) {
        logger.warn('Promotion cron skipped. Missing PROMOTION_FROM_YEAR / PROMOTION_TO_YEAR.')
        return
      }

      // Promotion runs per school. For now, require SCHOOL_IDS CSV in env.
      const schoolIds = (env.SCHOOL_IDS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      for (const schoolId of schoolIds) {
        const result = await promotionService.promoteStudentsByDOB({
          schoolId,
          fromYear,
          toYear,
          userId: env.SYSTEM_USER_ID,
          dryRun: false,
        })
        logger.info({ schoolId, result }, 'Yearly promotion completed')
      }
    } catch (err) {
      logger.error(err, 'Yearly promotion failed')
    }
  })
}
