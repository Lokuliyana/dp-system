const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const pastTeacherSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    fromYear: { type: Number, required: true },
    toYear: { type: Number }
  },
  { _id: false }
)

const gradeSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 1, max: 14 },

    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    pastTeachers: { type: [pastTeacherSchema], default: [] },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true }
  },
  baseSchemaOptions
)

gradeSchema.index({ schoolId: 1, level: 1, nameEn: 1 }, { unique: true })

module.exports = mongoose.model('Grade', gradeSchema)
