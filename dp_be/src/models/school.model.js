const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const schoolSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameSi: { type: String, required: true, trim: true },
    addressEn: { type: String, default: '' },
    addressSi: { type: String, default: '' },
  },
  baseSchemaOptions
)

module.exports = mongoose.model('School', schoolSchema)
