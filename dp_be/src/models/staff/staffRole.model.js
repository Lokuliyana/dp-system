const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const staffRoleSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    gradeBased: { type: Boolean, default: false },
    singleGraded: { type: Boolean, default: false },
    gradesEffected: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }],

    responsibilities: {
      type: [
        {
          level: { type: Number, enum: [1, 2], required: true },
          textSi: { type: String, required: true, trim: true },
          textEn: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },

    descriptionSi: { type: String, trim: true },
    descriptionEn: { type: String, trim: true },

    teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],

    order: { type: Number, default: 1 },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    systemRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
  },
  baseSchemaOptions
)

staffRoleSchema.index(
  { schoolId: 1, nameEn: 1 },
  { unique: true }
)

module.exports = mongoose.model('StaffRole', staffRoleSchema)
