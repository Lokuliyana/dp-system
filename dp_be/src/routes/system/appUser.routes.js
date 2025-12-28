const router = require('express').Router()
const ctrl = require('../../controllers/system/appUser.controller')
const validate = require('../../middlewares/validate.middleware')
const auth = require('../../middlewares/auth.middleware')
const authGuard = require('../../middlewares/authGuard')
const injectTenant = require('../../middlewares/tenant.middleware')
const V = require('../../validations/system/appUser.validation')

/* ---- PUBLIC AUTH ---- */
router.post('/login', validate(V.loginSchema), ctrl.login)
router.post('/refresh', ctrl.refresh)

/* ---- PROTECT EVERYTHING BELOW ---- */
router.use(auth)
router.use(injectTenant)

router.get('/me', ctrl.me)

/* ---- ADMIN USER CRUD ---- */
router.post(
  '/',
  authGuard(),
  validate(V.createAppUserSchema),
  ctrl.createAppUser
)

router.get(
  '/',
  authGuard('settings.user.read'),
  ctrl.listAppUsers
)

router.patch(
  '/:id',
  authGuard(),
  validate(V.updateAppUserSchema),
  ctrl.updateAppUser
)

router.delete(
  '/:id',
  authGuard(),
  validate(V.deleteAppUserSchema),
  ctrl.deleteAppUser
)

module.exports = router
