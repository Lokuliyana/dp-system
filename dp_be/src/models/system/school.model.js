const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const schoolSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameSi: { type: String, required: true, trim: true },
    addressEn: { type: String, default: '' },
    addressSi: { type: String, default: '' },
    attendanceConfig: {
      allowedDayOfWeek: { type: Number, default: 0 }, // 0 = Sunday
      startTime: { type: String, default: '07:30' },
      endTime: { type: String, default: '13:00' },
    },
  },
  baseSchemaOptions
)

module.exports = mongoose.model('School', schoolSchema)
