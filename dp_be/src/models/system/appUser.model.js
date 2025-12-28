const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const appUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
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
  },
  baseSchemaOptions
)

appUserSchema.index(
  { schoolId: 1, email: 1 },
  { unique: true }
)

module.exports = mongoose.model('AppUser', appUserSchema)
