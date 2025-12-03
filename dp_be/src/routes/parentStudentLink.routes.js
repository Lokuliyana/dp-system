const router = require('express').Router()
const ctrl = require('../controllers/parentStudentLink.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/parentStudentLink.validation')

router.post(
  '/',
  // permit([P.PARENT_STUDENT_LINK.LINK]),
  validate(V.linkParentStudentSchema),
  ctrl.linkParentStudent
)

router.patch(
  '/:id',
  // permit([P.PARENT_STUDENT_LINK.UPDATE]),
  validate(V.updateParentStudentLinkSchema),
  ctrl.updateParentStudentLink
)

router.delete(
  '/:id',
  // permit([P.PARENT_STUDENT_LINK.UNLINK]),
  validate(V.unlinkParentStudentSchema),
  ctrl.unlinkParentStudent
)

module.exports = router
