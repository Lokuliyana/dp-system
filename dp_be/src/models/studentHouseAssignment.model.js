const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const studentHouseAssignmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: true,
      index: true,
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    year: { type: Number, required: true, index: true },

    assignedDate: { type: Date, required: true },
    assignedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppUser',
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

studentHouseAssignmentSchema.index(
  { schoolId: 1, studentId: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('StudentHouseAssignment', studentHouseAssignmentSchema)
