const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const prefectPositionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    responsibilitySi: { type: String, trim: true },
    responsibilityEn: { type: String, trim: true },

    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    rankLevel: { type: Number },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

prefectPositionSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true })

module.exports = mongoose.model('PrefectPosition', prefectPositionSchema)
