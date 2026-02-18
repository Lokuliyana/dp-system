const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const examMarkSchema = new mongoose.Schema(
    {
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
            index: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            index: true
        },
        gradeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade',
            required: true,
            index: true
        }, // Snapshot of grade at time of exam

        mark: { type: Number, default: 0 },
        isPresent: { type: Boolean, default: true },

        comment: { type: String, trim: true },

        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
            index: true
        },

        recordedById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AppUser'
        }
    },
    baseSchemaOptions
)

// Ensure unique mark per student per exam
examMarkSchema.index({ examId: 1, studentId: 1 }, { unique: true })

module.exports = mongoose.model('ExamMark', examMarkSchema)
