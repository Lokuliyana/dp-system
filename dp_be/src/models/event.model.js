const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const eventSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    eventType: { type: String, trim: true }, // e.g. sports, cultural, seminar

    date: { type: Date, required: true },

    gradeIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }
    ],

    teacherInChargeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },

    year: { type: Number, required: true, index: true },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true
    },
  },
  baseSchemaOptions
)

eventSchema.index(
  { schoolId: 1, nameEn: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('Event', eventSchema)
