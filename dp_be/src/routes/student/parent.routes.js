const router = require('express').Router()
const ctrl = require('../../controllers/student/parent.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/student/parent.validation')

router.post(
  '/',
  // permit([P.PARENT.CREATE]),
  validate(V.createParentSchema),
  ctrl.createParent
)

router.get(
  '/',
  // permit([P.PARENT.READ]),
  validate(V.listParentsSchema),
  ctrl.listParents
)

router.patch(
  '/:id',
  // permit([P.PARENT.UPDATE]),
  validate(V.updateParentSchema),
  ctrl.updateParent
)

router.delete(
  '/:id',
  // permit([P.PARENT.DELETE]),
  validate(V.deleteParentSchema),
  ctrl.deleteParent
)

module.exports = router
