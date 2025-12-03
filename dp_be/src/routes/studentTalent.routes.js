const router = require('express').Router()
const ctrl = require('../controllers/studentTalent.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/studentTalent.validation')

router.post(
  '/',
  // permit([P.STUDENT_TALENT.CREATE]),
  validate(V.createStudentTalentSchema),
  ctrl.createStudentTalent
)

router.get(
  '/',
  // permit([P.STUDENT_TALENT.READ]),
  validate(V.listStudentTalentSchema),
  ctrl.listStudentTalents
)

router.patch(
  '/:id',
  // permit([P.STUDENT_TALENT.UPDATE]),
  validate(V.updateStudentTalentSchema),
  ctrl.updateStudentTalent
)

router.delete(
  '/:id',
  // permit([P.STUDENT_TALENT.DELETE]),
  validate(V.deleteStudentTalentSchema),
  ctrl.deleteStudentTalent
)

module.exports = router
