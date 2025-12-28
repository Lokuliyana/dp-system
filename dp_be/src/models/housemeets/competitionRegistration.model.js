const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const registrationSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
      index: true,
    },

    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      default: null,
      index: true,
    },

    mode: {
      type: String,
      enum: ['house', 'independent'],
      required: true,
    },

    year: { type: Number, required: true, index: true },

    registeredById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

// A student can only have ONE registration per competition per year
registrationSchema.index(
  { schoolId: 1, competitionId: 1, studentId: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('CompetitionRegistration', registrationSchema)
