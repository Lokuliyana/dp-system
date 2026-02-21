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
      enum: ['Normal', 'Sunday', 'PublicHoliday', 'OrganizationalHoliday', 'SpecialEvent'],
      default: 'Normal',
      required: true
    },
    label: {
      type: String,
      default: '',
      trim: true
    },
    isWorking: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: String,
      default: '08:00'
    },
    endTime: {
      type: String,
      default: '17:00'
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true
    }
  },
  baseSchemaOptions
)

module.exports = mongoose.model('OrganizationCalendar', organizationCalendarSchema)
