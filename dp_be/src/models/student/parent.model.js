const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const parentSchema = new mongoose.Schema(
  {
    firstNameSi: { type: String, trim: true },
    lastNameSi: { type: String, trim: true },
    fullNameSi: { type: String, trim: true },

    firstNameEn: { type: String, required: true, trim: true },
    lastNameEn: { type: String, required: true, trim: true },
    fullNameEn: { type: String, trim: true },

    occupationSi: { type: String, trim: true },
    occupationEn: { type: String, trim: true },

    email: { type: String, trim: true, lowercase: true },
    phoneNum: { type: String, trim: true },

    addressSi: { type: String, trim: true },
    addressEn: { type: String, trim: true },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

parentSchema.index({ schoolId: 1, phoneNum: 1 })
parentSchema.index({ schoolId: 1, email: 1 })

parentSchema.pre('save', function setFullNames() {
  this.fullNameEn = `${this.firstNameEn} ${this.lastNameEn}`.trim()
  if (this.firstNameSi || this.lastNameSi) {
    this.fullNameSi = `${this.firstNameSi || ''} ${this.lastNameSi || ''}`.trim()
  }
})

module.exports = mongoose.model('Parent', parentSchema)
