const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const memberSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClubPosition',
      default: null,
    },
  },
  { _id: false }
)

const clubSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    teacherInChargeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },

    year: { type: Number, required: true },

    members: { type: [memberSchema], default: [] },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

clubSchema.index(
  { schoolId: 1, nameEn: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('Club', clubSchema)
