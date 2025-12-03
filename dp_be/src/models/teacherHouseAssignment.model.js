const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const teacherHouseAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },

    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: true,
      index: true,
    },

    assignedDate: { type: Date, default: Date.now },
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

teacherHouseAssignmentSchema.index(
  { schoolId: 1, teacherId: 1 },
  { unique: true }
)

module.exports = mongoose.model(
  'TeacherHouseAssignment',
  teacherHouseAssignmentSchema
)
