const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const houseSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    color: { type: String, required: true, trim: true },
    mottoSi: { type: String, trim: true },
    mottoEn: { type: String, trim: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  },
  baseSchemaOptions
)

houseSchema.index({ schoolId: 1, nameEn: 1 }, { unique: true })

module.exports = mongoose.model('House', houseSchema)
