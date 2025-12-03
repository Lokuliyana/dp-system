const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const competitionSchema = new mongoose.Schema(
  {
    nameSi: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },

    squadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Squad',
      index: true,
    },

    scope: {
      type: String,
      enum: ['open', 'grade', 'section'],
      required: true,
    },
    gradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }],
    sectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],

    isMainCompetition: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    year: { type: Number, index: true }, // Optional now

    participationType: {
      type: String,
      enum: ['individual', 'team'],
      default: 'individual',
      required: true,
    },

    teamConfig: {
      minSize: { type: Number, default: 1 },
      maxSize: { type: Number, default: 1 },
    },

    personalAwards: [{ type: String }],

    pointsConfig: {
      place1: { type: Number, default: 15 },
      place2: { type: Number, default: 10 },
      place3: { type: Number, default: 5 },
      place4: { type: Number, default: 0 },
      place5: { type: Number, default: 0 },
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
  },
  baseSchemaOptions
)

competitionSchema.index(
  { schoolId: 1, squadId: 1, year: 1, nameEn: 1 },
  { unique: true }
)

module.exports = mongoose.model('Competition', competitionSchema)
