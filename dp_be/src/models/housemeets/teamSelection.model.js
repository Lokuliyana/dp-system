const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const teamEntrySchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    place: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
)

const teamSelectionSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ['zonal', 'district', 'allisland'],
      required: true,
      index: true,
    },
    year: { type: Number, required: true, index: true },

    entries: { type: [teamEntrySchema], default: [] },

    totalMarks: { type: Number, default: 0 },
    teamPosition: { type: Number },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

teamSelectionSchema.index(
  { schoolId: 1, level: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('TeamSelection', teamSelectionSchema)
