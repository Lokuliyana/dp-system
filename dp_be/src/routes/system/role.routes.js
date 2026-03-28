const router = require('express').Router()
const ctrl = require('../../controllers/system/role.controller')
const validate = require('../../middlewares/validate.middleware')
const auth = require('../../middlewares/auth.middleware')
const authGuard = require('../../middlewares/authGuard')
const injectTenant = require('../../middlewares/tenant.middleware')
const V = require('../../validations/system/role.validation')
const P = require('../../constants/permissions')

router.use(auth)
router.use(injectTenant)

router.post(
  '/',
  authGuard(P.ROLE.CREATE),
  validate(V.createRoleSchema),
  ctrl.createRole
)

router.get(
  '/',
  authGuard(P.ROLE.READ),
  ctrl.listRoles
)

router.patch(
  '/:id',
  authGuard(P.ROLE.UPDATE),
  validate(V.updateRoleSchema),
  ctrl.updateRole
)

router.delete(
  '/:id',
  authGuard(P.ROLE.DELETE),
  validate(V.deleteRoleSchema),
  ctrl.deleteRole
)

module.exports = router
