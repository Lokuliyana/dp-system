const router = require('express').Router()
const ctrl = require('../controllers/appUser.controller')
const validate = require('../middlewares/validate.middleware')
const auth = require('../middlewares/auth.middleware')
const injectTenant = require('../middlewares/tenant.middleware')
const V = require('../validations/appUser.validation')

/* ---- PUBLIC AUTH ---- */
router.post('/login', validate(V.loginSchema), ctrl.login)
router.post('/refresh', ctrl.refresh)

/* ---- PROTECT EVERYTHING BELOW ---- */
router.use(auth)
router.use(injectTenant)

/* ---- ADMIN USER CRUD ---- */
router.post(
  '/',
  // permit([P.APP_USER.CREATE]),
  validate(V.createAppUserSchema),
  ctrl.createAppUser
)

router.get(
  '/',
  // permit([P.APP_USER.READ]),
  ctrl.listAppUsers
)

router.patch(
  '/:id',
  // permit([P.APP_USER.UPDATE]),
  validate(V.updateAppUserSchema),
  ctrl.updateAppUser
)

router.delete(
  '/:id',
  // permit([P.APP_USER.DELETE]),
  validate(V.deleteAppUserSchema),
  ctrl.deleteAppUser
)

module.exports = router
