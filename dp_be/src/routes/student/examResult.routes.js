const router = require('express').Router()
const ctrl = require('../../controllers/student/examResult.controller')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/student/examResult.validation')

// create empty sheet for term+grade
router.post(
  '/sheet',
  // permit([P.EXAM_RESULT.CREATE_SHEET]),
  validate(V.createExamResultSheet),
  ctrl.createExamResultSheet
)

// bulk upsert results (creates sheet if missing)
router.put(
  '/',
  // permit([P.EXAM_RESULT.UPSERT]),
  validate(V.upsertExamResults),
  ctrl.upsertExamResults
)

// per-student exam history
router.get(
  '/student/:studentId',
  // permit([P.EXAM_RESULT.READ]),
  validate(V.listByStudent),
  ctrl.listExamResultsByStudent
)

// grade sheet(s)
router.get(
  '/grade/:gradeId',
  // permit([P.EXAM_RESULT.READ]),
  validate(V.listByGrade),
  ctrl.listExamResultsByGrade
)

module.exports = router
