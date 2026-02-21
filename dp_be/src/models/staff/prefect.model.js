const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const ranks = [
  'head-prefect',
  'deputy-head-prefect',
  'senior-prefect',
  'junior-prefect',
  'primary-prefect',
]

const prefectStudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentNameSi: { type: String, trim: true },
    studentNameEn: { type: String, trim: true },

    rank: { type: String, enum: ranks, required: true },

    positionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'PrefectPosition' },
    ],
  },
  { _id: false }
)

const prefectSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, index: true },
    appointedDate: { type: Date, required: true },

    students: { type: [prefectStudentSchema], default: [] },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

prefectSchema.index({ schoolId: 1, year: 1 }, { unique: true })

module.exports = mongoose.model('Prefect', prefectSchema)
