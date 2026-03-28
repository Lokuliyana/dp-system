const router = require('express').Router()
const ctrl = require('../../controllers/student/attendance.controller')
const dashCtrl = require('../../controllers/student/attendance-dashboard.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/student/attendance.validation')
const permit = require('../../middlewares/permit.middleware')
const P = require('../../constants/permissions')

router.post(
  '/',
  permit([P.ATTENDANCE.MARK]),
  validate(V.markAttendanceSchema),
  ctrl.markAttendance
)

router.patch(
  '/:id',
  permit([P.ATTENDANCE.UPDATE]),
  validate(V.updateAttendanceSchema),
  ctrl.updateAttendance
)

router.get(
  '/by-date',
  permit([P.ATTENDANCE.READ]),
  validate(V.listAttendanceByDateSchema),
  ctrl.listAttendanceByDate
)

router.get(
  '/by-student/:studentId',
  permit([P.ATTENDANCE.READ]),
  validate(V.listAttendanceByStudentSchema),
  ctrl.listAttendanceByStudent
)

router.delete(
  '/:id',
  permit([P.ATTENDANCE.DELETE]),
  validate(V.deleteAttendanceSchema),
  ctrl.deleteAttendance
)

router.get(
  '/stats',
  permit([P.ATTENDANCE.READ]),
  validate(V.getAttendanceStatsSchema),
  ctrl.getAttendanceStats
)

router.get(
  '/dashboard-stats',
  permit([P.ATTENDANCE.READ]),
  dashCtrl.getAttendanceDashboardStats
)

router.get(
  '/by-range',
  permit([P.ATTENDANCE.READ]),
  validate(V.listAttendanceByRangeSchema),
  ctrl.listAttendanceByRange
)

module.exports = router
