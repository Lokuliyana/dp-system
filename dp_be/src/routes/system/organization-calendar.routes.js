const router = require('express').Router()
const calendarController = require('../../controllers/system/organization-calendar.controller')
const authGuard = require('../../middlewares/authGuard')
const P = require('../../constants/permissions')

router.get('/', authGuard(P.ORGANIZATION_CALENDAR.READ), calendarController.getCalendarRange)
router.post('/', authGuard(P.ORGANIZATION_CALENDAR.UPDATE), calendarController.upsertDayConfig)
router.delete('/', authGuard(P.ORGANIZATION_CALENDAR.UPDATE), calendarController.deleteDayConfig)

module.exports = router
