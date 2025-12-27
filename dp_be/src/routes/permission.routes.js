const router = require('express').Router()
const controller = require('../controllers/permission.controller')
const auth = require('../middlewares/auth.middleware')

router.use(auth)

router.get('/', controller.listPermissions)

module.exports = router
