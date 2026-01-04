const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const appUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      index: true,
    },

    password: { type: String, required: true },

    roleIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      index: true,
    }],

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      index: true,
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },

    isActive: { type: Boolean, default: true },
    permissions: { type: [String], default: [] },
    restrictedGradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }],
  },
  baseSchemaOptions
)

appUserSchema.virtual('roleId').get(function () {
  if (this.roleIds && this.roleIds.length > 0) {
    const first = this.roleIds[0]
    return typeof first === 'object' ? (first._id || first.id) : first
  }
  return null
})

appUserSchema.index(
  { schoolId: 1, email: 1 },
  { unique: true, sparse: true }
)

appUserSchema.index(
  { schoolId: 1, phone: 1 },
  { unique: true, sparse: true }
)

module.exports = mongoose.model('AppUser', appUserSchema)

