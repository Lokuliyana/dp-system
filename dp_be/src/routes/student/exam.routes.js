const express = require('express')
const examController = require('../../controllers/student/exam.controller')
const auth = require('../../middlewares/auth.middleware')
const validate = require('../../middlewares/validate.middleware')
// Note: We might need a validation schema here later, skipping for now to speed up.

const router = express.Router()

router
    .route('/')
    .post(auth, examController.createExam)
    .get(auth, examController.getExams)

router
    .route('/:examId/marks')
    .get(auth, examController.getExamMarksOrStudents)
    .post(auth, examController.updateMarks)

router
    .route('/student/:studentId/history')
    .get(auth, examController.getStudentExamHistory)

module.exports = router
