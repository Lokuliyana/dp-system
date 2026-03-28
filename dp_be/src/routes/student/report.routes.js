const router = require('express').Router()
const ctrl = require('../../controllers/student/report.controller')
const auth = require('../../middlewares/auth.middleware')
const injectTenant = require('../../middlewares/tenant.middleware')
const permit = require('../../middlewares/permit.middleware')
const P = require('../../constants/permissions')

router.use(auth)
router.use(injectTenant)

router.get('/student/:id', permit([P.REPORT.READ]), ctrl.reportStudent)
router.get('/grade/:id', permit([P.REPORT.READ]), ctrl.reportGrade)
router.get('/teacher/:id', permit([P.REPORT.READ]), ctrl.reportTeacher)
router.get('/house/:id', permit([P.REPORT.READ]), ctrl.reportHouse)
router.get('/teams', permit([P.REPORT.READ]), ctrl.reportTeams)

module.exports = router
