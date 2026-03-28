const express = require('express')
const router = express.Router()
const controller = require('../../controllers/student/analytics.controller')
const auth = require('../../middlewares/auth.middleware')
const permit = require('../../middlewares/permit.middleware')
const P = require('../../constants/permissions')

// All analytics require authentication
router.use(auth)

router.get('/student/:id', permit([P.ANALYTICS.READ]), controller.getStudentAnalytics)
router.get('/grade/:id', permit([P.ANALYTICS.READ]), controller.getGradeAnalytics)
router.get('/organization', permit([P.ANALYTICS.READ]), controller.getOrganizationAnalytics)

module.exports = router
