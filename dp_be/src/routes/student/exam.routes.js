const express = require('express')
const examController = require('../../controllers/student/exam.controller')
const auth = require('../../middlewares/auth.middleware')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/student/exam.validation')

const router = express.Router()

router
    .route('/')
    .post(auth, validate(V.createExam), examController.createExam)
    .get(auth, validate(V.getExams), examController.getExams)

router
    .route('/:examId/marks')
    .get(auth, validate(V.getExamMarksOrStudents), examController.getExamMarksOrStudents)
    .post(auth, validate(V.updateMarks), examController.updateMarks)

router
    .route('/student/:studentId/history')
    .get(auth, validate(V.getStudentExamHistory), examController.getStudentExamHistory)

module.exports = router
