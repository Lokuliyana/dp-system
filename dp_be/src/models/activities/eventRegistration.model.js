const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },

    year: { type: Number, required: true, index: true },

    registeredAt: { type: Date, default: Date.now },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true
    },
  },
  baseSchemaOptions
)

eventRegistrationSchema.index(
  { schoolId: 1, eventId: 1, studentId: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema)
