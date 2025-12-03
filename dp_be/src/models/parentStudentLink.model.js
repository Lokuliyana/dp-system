const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const parentStudentLinkSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    relationshipSi: { type: String, trim: true }, // e.g., මව / පියා
    relationshipEn: { type: String, trim: true }, // e.g., Mother / Father

    isPrimary: { type: Boolean, default: false },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

parentStudentLinkSchema.index(
  { schoolId: 1, parentId: 1, studentId: 1 },
  { unique: true }
)

module.exports = mongoose.model('ParentStudentLink', parentStudentLinkSchema)
