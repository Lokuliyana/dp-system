const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },

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

    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },

    recordedById: {
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

/* Prevent duplicate per student per date */
attendanceSchema.index(
  { schoolId: 1, studentId: 1, date: 1 },
  { unique: true }
)

module.exports = mongoose.model('Attendance', attendanceSchema)
