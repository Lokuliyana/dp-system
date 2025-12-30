const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
    singleGraded: { type: Boolean, default: false },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
  },
  baseSchemaOptions
)

roleSchema.index({ schoolId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Role', roleSchema)
