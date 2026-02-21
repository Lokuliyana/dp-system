const express = require('express')
const router = express.Router()
const controller = require('../../controllers/student/analytics.controller')
const auth = require('../../middlewares/auth.middleware')

// All analytics require authentication
router.use(auth)

router.get('/student/:id', controller.getStudentAnalytics)
router.get('/grade/:id', controller.getGradeAnalytics)
router.get('/organization', controller.getOrganizationAnalytics)

module.exports = router
