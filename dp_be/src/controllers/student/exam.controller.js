const Exam = require('../../models/student/exam.model')
const ExamMark = require('../../models/student/examMark.model')
const Student = require('../../models/student/student.model')
const catchAsync = require('../../utils/catchAsync')
const ApiError = require('../../utils/apiError')

const createExam = catchAsync(async (req, res) => {
    console.log('[DEBUG] createExam body:', JSON.stringify(req.body));
    console.log('[DEBUG] req.user:', { id: req.user.id, schoolId: req.user.schoolId });
    
    const exam = await Exam.create({
        ...req.body,
        schoolId: req.user.schoolId,
        createdById: req.user.id
    })
    console.log('[DEBUG] Exam created:', exam._id);
    res.status(201).send({ status: 'success', data: exam })
})

const getExams = catchAsync(async (req, res) => {
    const filter = { schoolId: req.user.schoolId }
    if (req.query.year) filter.year = req.query.year
    if (req.query.gradeId) filter.gradeIds = req.query.gradeId

    const exams = await Exam.find(filter)
        .populate('gradeIds', 'nameEn nameSi')
        .sort({ date: -1 })

    res.send({ status: 'success', data: exams })
})

const getExamMarksOrStudents = catchAsync(async (req, res) => {
    const { examId } = req.params
    const { gradeId } = req.query

    if (!gradeId) {
        throw new ApiError(400, 'Grade ID is required')
    }

    const exam = await Exam.findOne({ _id: examId, schoolId: req.user.schoolId })
    if (!exam) {
        throw new ApiError(404, 'Exam not found')
    }

    // 1. Get all students in this grade
    const students = await Student.find({
        schoolId: req.user.schoolId,
        gradeId,
        status: 'active'
    })
        .select('firstNameEn lastNameEn admissionNumber photoUrl nameWithInitialsSi fullNameEn')
        .sort({ admissionNumber: 1 })

    // 2. Get existing marks for this exam + grade
    const marks = await ExamMark.find({
        examId,
        gradeId,
        schoolId: req.user.schoolId
    })

    // 3. Merge
    const result = students.map(student => {
        const markEntry = marks.find(m => m.studentId.toString() === student.id)
        return {
            student,
            mark: markEntry ? markEntry.mark : '',
            isPresent: markEntry ? markEntry.isPresent : true,
            comment: markEntry ? markEntry.comment : '',
            markId: markEntry ? markEntry._id : null
        }
    })

    res.send({ status: 'success', data: result })
})

const updateMarks = catchAsync(async (req, res) => {
    const { examId } = req.params
    const { marks } = req.body // Array of { studentId, gradeId, mark, isPresent, comment }

    const exam = await Exam.findOne({ _id: examId, schoolId: req.user.schoolId })
    if (!exam) {
        throw new ApiError(404, 'Exam not found')
    }

    const ops = marks.map(entry => ({
        updateOne: {
            filter: {
                examId,
                studentId: entry.studentId
            },
            update: {
                $set: {
                    examId,
                    studentId: entry.studentId,
                    gradeId: entry.gradeId, // Snapshot grade
                    mark: entry.mark,
                    isPresent: entry.isPresent,
                    comment: entry.comment,
                    schoolId: req.user.schoolId,
                    recordedById: req.user.id
                }
            },
            upsert: true
        }
    }))

    if (ops.length > 0) {
        await ExamMark.bulkWrite(ops)
    }

    res.send({ status: 'success', message: 'Marks updated successfully' })
})

const getStudentExamHistory = catchAsync(async (req, res) => {
    const { studentId } = req.params

    const history = await ExamMark.find({
        studentId,
        schoolId: req.user.schoolId
    })
        .populate('examId', 'nameSi nameEn date type')
        .populate('gradeId', 'nameEn')
        .sort({ 'examId.date': -1 })

    // Filter out any where examId might be null (if exam deleted)
    const cleanHistory = history.filter(h => h.examId)

    // Sort by date descending
    cleanHistory.sort((a, b) => new Date(b.examId.date) - new Date(a.examId.date))

    res.send({ status: 'success', data: cleanHistory })
})

module.exports = {
    createExam,
    getExams,
    getExamMarksOrStudents,
    updateMarks,
    getStudentExamHistory
}
