const router = require('express').Router()
const controller = require('../../controllers/system/permission.controller')
const authGuard = require('../../middlewares/authGuard')
const P = require('../../constants/permissions')

router.get('/', authGuard(P.PERMISSION.READ), controller.listPermissions)

module.exports = router
