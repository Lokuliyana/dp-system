const router = require('express').Router()
const ctrl = require('../../controllers/system/dashboard.controller')
const permit = require('../../middlewares/permit.middleware')
const P = require('../../constants/permissions')

router.get(
  '/',
  permit([P.ANALYTICS.READ]),
  ctrl.getDashboardData
)

module.exports = router
