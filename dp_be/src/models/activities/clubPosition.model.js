const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const clubPositionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    responsibilitySi: { type: String, trim: true },
    responsibilityEn: { type: String, trim: true },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

clubPositionSchema.index(
  { schoolId: 1, nameEn: 1 },
  { unique: true }
)

module.exports = mongoose.model('ClubPosition', clubPositionSchema)
