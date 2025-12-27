const router = require('express').Router()
const ctrl = require('../controllers/section.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/section.validation')

router.post(
  '/',
  // permit([P.SECTION.CREATE]),
  validate(V.createSectionSchema),
  ctrl.createSection
)

router.get(
  '/',
  // permit([P.SECTION.READ]),
  ctrl.listSections
)

router.get(
  '/by-grade',
  // permit([P.SECTION.READ]),
  validate(V.listSectionsByGradeSchema),
  ctrl.listSectionsByGrade
)

router.patch(
  '/:id',
  // permit([P.SECTION.UPDATE]),
  validate(V.updateSectionSchema),
  ctrl.updateSection
)

router.delete(
  '/:id',
  // permit([P.SECTION.DELETE]),
  validate(V.deleteSectionSchema),
  ctrl.deleteSection
)

module.exports = router
