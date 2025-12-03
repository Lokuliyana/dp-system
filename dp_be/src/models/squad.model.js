const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const squadSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Shield' },

    assignedGradeIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', index: true }
    ],

    assignedSectionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Section', index: true }
    ],

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true }
  },
  baseSchemaOptions
)

squadSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true })

module.exports = mongoose.model('Squad', squadSchema)
