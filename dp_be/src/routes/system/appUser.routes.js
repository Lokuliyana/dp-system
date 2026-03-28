const router = require('express').Router()
const ctrl = require('../../controllers/system/appUser.controller')
const validate = require('../../middlewares/validate.middleware')
const auth = require('../../middlewares/auth.middleware')
const authGuard = require('../../middlewares/authGuard')
const injectTenant = require('../../middlewares/tenant.middleware')
const V = require('../../validations/system/appUser.validation')
const P = require('../../constants/permissions')

/* ---- PUBLIC AUTH ---- */
router.post('/login', validate(V.loginSchema), ctrl.login)
router.post('/refresh', ctrl.refresh)

/* ---- PROTECT EVERYTHING BELOW ---- */
router.use(auth)
router.use(injectTenant)

router.get('/me', ctrl.me)
router.post('/reset-password', ctrl.resetPassword)

/* ---- ADMIN USER CRUD ---- */
router.post(
  '/',
  authGuard(P.APP_USER.CREATE),
  validate(V.createAppUserSchema),
  ctrl.createAppUser
)

router.get(
  '/',
  authGuard(P.APP_USER.READ),
  ctrl.listAppUsers
)

router.get(
  '/:id',
  authGuard(P.APP_USER.READ),
  ctrl.getAppUser
)

router.patch(
  '/:id',
  authGuard(P.APP_USER.UPDATE),
  validate(V.updateAppUserSchema),
  ctrl.updateAppUser
)

router.delete(
  '/:id',
  authGuard(P.APP_USER.DELETE),
  validate(V.deleteAppUserSchema),
  ctrl.deleteAppUser
)

module.exports = router
