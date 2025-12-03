const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const pastRoleSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StaffRole',
      required: true,
    },
    fromYear: { type: Number, required: true },
    toYear: { type: Number },
  },
  { _id: false }
)

const teacherSchema = new mongoose.Schema(
  {
    firstNameSi: { type: String, trim: true },
    lastNameSi: { type: String, trim: true },
    fullNameSi: { type: String, trim: true },

    firstNameEn: { type: String, required: true, trim: true },
    lastNameEn: { type: String, required: true, trim: true },
    fullNameEn: { type: String, trim: true },

    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    dob: { type: Date },
    dateJoined: { type: Date, required: true },

    roleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StaffRole' }],
    pastRoles: { type: [pastRoleSchema], default: [] },

    qualifications: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  },
  baseSchemaOptions
)

teacherSchema.pre('save', function setFullNames(next) {
  this.fullNameEn = `${this.firstNameEn} ${this.lastNameEn}`.trim()
  if (this.firstNameSi || this.lastNameSi) {
    this.fullNameSi = `${this.firstNameSi || ''} ${this.lastNameSi || ''}`.trim()
  }
  // no callback needed; mongoose handles sync hooks
})

teacherSchema.index({ schoolId: 1, email: 1 })
teacherSchema.index({ schoolId: 1, fullNameEn: 1 })

module.exports = mongoose.model('Teacher', teacherSchema)
