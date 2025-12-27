const router = require('express').Router()
const ctrl = require('../controllers/student.controller')
const validate = require('../middlewares/validate.middleware')
const V = require('../validations/student.validation')

router.post(
  '/',
  // permit([P.STUDENT.CREATE]),
  validate(V.createStudentSchema),
  ctrl.createStudent
)

router.post(
  '/bulk-import',
  // permit([P.STUDENT.CREATE]),
  require('../middlewares/upload.middleware').single('file'),
  ctrl.bulkImportStudents
)

// universal list with pagination and search
router.get(
  '/',
  // permit([P.STUDENT.READ]),
  validate(V.listStudentsSchema),
  ctrl.listStudents
)

// list by grade via query: /students/by-grade?gradeId=...
router.get(
  '/by-grade',
  // permit([P.STUDENT.READ]),
  validate(V.listStudentsByGradeSchema),
  ctrl.listStudentsByGrade
)

router.get(
  '/:id/360',
  // permit([P.STUDENT.READ]),
  validate(V.getStudent360Schema),
  ctrl.getStudent360
)

router.patch(
  '/:id',
  // permit([P.STUDENT.UPDATE]),
  validate(V.updateStudentBasicInfoSchema),
  ctrl.updateStudentBasicInfo
)

router.delete(
  '/:id',
  // permit([P.STUDENT.DELETE]),
  validate(V.deleteStudentSchema),
  ctrl.deleteStudent
)

router.post(
  '/:id/notes',
  // permit([P.STUDENT.UPDATE]),
  validate(V.addStudentNoteSchema),
  ctrl.addStudentNote
)

router.delete(
  '/:id/notes/:noteId',
  // permit([P.STUDENT.UPDATE]),
  validate(V.removeStudentNoteSchema),
  ctrl.removeStudentNote
)

module.exports = router
