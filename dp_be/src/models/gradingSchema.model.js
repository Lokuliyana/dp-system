const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const gradeBandSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. A, B, C
    minPercentage: { type: Number, required: true }, // 75
    maxPercentage: { type: Number, required: true }, // 100
    color: { type: String, trim: true }, // optional UI color
    order: { type: Number, required: true }, // order of display
  },
  { _id: false }
)

const gradingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Default Grading Schema"

    bands: { type: [gradeBandSchema], required: true },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

gradingSchema.index({ schoolId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('GradingSchema', gradingSchema)
