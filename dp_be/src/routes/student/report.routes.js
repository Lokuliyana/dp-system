const router = require('express').Router()
const ctrl = require('../../controllers/student/report.controller')
const auth = require('../../middlewares/auth.middleware')
const injectTenant = require('../../middlewares/tenant.middleware')

router.use(auth)
router.use(injectTenant)

router.get('/student/:id', ctrl.reportStudent)
router.get('/grade/:id', ctrl.reportGrade)
router.get('/teacher/:id', ctrl.reportTeacher)
router.get('/house/:id', ctrl.reportHouse)
router.get('/teams', ctrl.reportTeams)

module.exports = router
