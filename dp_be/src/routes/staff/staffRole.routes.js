const router = require('express').Router()
const ctrl = require('../../controllers/staff/staffRole.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/staff/staffRole.validation')

router.post(
  '/',
  // permit([P.STAFF_ROLE.CREATE]),
  validate(V.createStaffRoleSchema),
  ctrl.createStaffRole
)

router.get(
  '/',
  // permit([P.STAFF_ROLE.READ]),
  ctrl.listStaffRoles
)

router.patch(
  '/:id',
  // permit([P.STAFF_ROLE.UPDATE]),
  validate(V.updateStaffRoleSchema),
  ctrl.updateStaffRole
)

router.delete(
  '/:id',
  // permit([P.STAFF_ROLE.DELETE]),
  validate(V.deleteStaffRoleSchema),
  ctrl.deleteStaffRole
)

module.exports = router
