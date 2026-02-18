const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const examSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        date: { type: Date, required: true, index: true },
        type: {
            type: String,
            enum: ['paper', 'exam', 'assignment'],
            default: 'exam',
            required: true
        },

        gradeIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        }],

        term: { type: Number, min: 1, max: 3 }, // Optional: link to a term if needed
        year: { type: Number, required: true, index: true }, // Academic Year

        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
            index: true
        },

        // Metadata
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AppUser'
        }
    },
    baseSchemaOptions
)

examSchema.index({ schoolId: 1, date: 1 })
examSchema.index({ schoolId: 1, year: 1 })

module.exports = mongoose.model('Exam', examSchema)
