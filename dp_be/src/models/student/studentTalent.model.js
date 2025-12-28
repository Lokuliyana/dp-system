const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    achievedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const studentTalentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    talentName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    year: { type: Number, required: true, index: true },

    achievements: { type: [achievementSchema], default: [] },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

studentTalentSchema.index(
  { schoolId: 1, studentId: 1, talentName: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('StudentTalent', studentTalentSchema)
