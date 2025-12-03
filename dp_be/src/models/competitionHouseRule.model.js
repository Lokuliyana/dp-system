const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const competitionHouseRuleSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    year: { type: Number, required: true, index: true },

    maxPerHousePerGrade: { type: Number, default: 2 },
    maxTotalPerGrade: { type: Number, default: 8 },
    noteSi: { type: String, trim: true },
    noteEn: { type: String, trim: true },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  },
  baseSchemaOptions
)

competitionHouseRuleSchema.index(
  { schoolId: 1, competitionId: 1, year: 1 },
  { unique: true }
)

module.exports = mongoose.model('CompetitionHouseRule', competitionHouseRuleSchema)
