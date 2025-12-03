const mongoose = require('mongoose')
const { baseSchemaOptions } = require('./_base')

const competitionResultSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    year: { type: Number, required: true, index: true },

    place: { type: Number, enum: [0, 1, 2, 3, 4, 5], required: true },

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompetitionTeam' },

    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House' },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },

    personalAwardWinners: [{
      awardName: { type: String, required: true },
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House' }
    }],

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  },
  baseSchemaOptions
)

competitionResultSchema.index(
  { schoolId: 1, competitionId: 1, year: 1, place: 1 },
  { unique: true }
)

module.exports = mongoose.model('CompetitionResult', competitionResultSchema)
