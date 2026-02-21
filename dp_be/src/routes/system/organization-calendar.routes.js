const router = require('express').Router()
const calendarController = require('../../controllers/system/organization-calendar.controller')
const auth = require('../../middlewares/auth.middleware')

router.use(auth)

router.get('/', calendarController.getCalendarRange)
router.post('/', calendarController.upsertDayConfig)
router.delete('/', calendarController.deleteDayConfig)

module.exports = router
