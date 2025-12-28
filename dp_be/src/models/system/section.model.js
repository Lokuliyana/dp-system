const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const sectionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },

    assignedGradeIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', index: true }
    ]
  },
  baseSchemaOptions
)

sectionSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true })

module.exports = mongoose.model('Section', sectionSchema)
