const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const perStudentResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    mark: { type: Number, required: true },
    gradingSchemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GradingSchema',
      required: true,
    },
  },
  { _id: false }
)

const examResultSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, index: true },
    term: { type: Number, required: true, min: 1, max: 3 },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
      index: true,
    },

    results: { type: [perStudentResultSchema], default: [] },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

examResultSchema.index(
  { schoolId: 1, year: 1, term: 1, gradeId: 1 },
  { unique: true }
)

module.exports = mongoose.model('ExamResult', examResultSchema)
