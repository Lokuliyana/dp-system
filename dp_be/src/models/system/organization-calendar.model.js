const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const organizationCalendarSchema = new mongoose.Schema(
  {
    date: { 
      type: Date, 
      required: true, 
      unique: true, 
      index: true 
    },
    type: {
      type: String,
      enum: ['Normal', 'Sunday', 'PublicHoliday', 'OrganizationalHoliday', 'SpecialDay', 'SpecialEvent'],
      default: 'Normal',
      required: true
    },
    label: {
      type: String,
      default: '',
      trim: true
    },
    startTime: { type: String },
    endTime: { type: String },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true
    }
  },
  baseSchemaOptions
)

module.exports = mongoose.model('OrganizationCalendar', organizationCalendarSchema)
