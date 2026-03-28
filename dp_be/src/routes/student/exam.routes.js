const express = require('express')
const examController = require('../../controllers/student/exam.controller')
const auth = require('../../middlewares/auth.middleware')
const validate = require('../../middlewares/validate.middleware')
const V = require('../../validations/student/exam.validation')
const permit = require('../../middlewares/permit.middleware')
const P = require('../../constants/permissions')

const router = express.Router()

router
    .route('/')
    .post(auth, permit([P.EXAM.CREATE]), validate(V.createExam), examController.createExam)
    .get(auth, permit([P.EXAM.READ]), validate(V.getExams), examController.getExams)

router
    .route('/:examId/marks')
    .get(auth, permit([P.EXAM.READ]), validate(V.getExamMarksOrStudents), examController.getExamMarksOrStudents)
    .post(auth, permit([P.EXAM.UPDATE_MARKS]), validate(V.updateMarks), examController.updateMarks)

router
    .route('/student/:studentId/history')
    .get(auth, permit([P.EXAM.READ]), validate(V.getStudentExamHistory), examController.getStudentExamHistory)

module.exports = router
