const mongoose = require('mongoose')
const { baseSchemaOptions } = require('../system/_base')

const competitionTeamSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
      index: true,
    },
    year: { type: Number, required: true, index: true },

    type: {
      type: String,
      enum: ['house', 'independent'],
      required: true,
      index: true,
    },

    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', index: true, default: null },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', index: true },

    teamNameSi: { type: String, trim: true },
    teamNameEn: { type: String, trim: true },

    memberStudentIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    ],

    registeredById: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser' },

    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', index: true },
  },
  baseSchemaOptions
)

// Non-unique compound index as per spec
competitionTeamSchema.index({
  schoolId: 1,
  competitionId: 1,
  year: 1,
  type: 1,
  houseId: 1,
})

module.exports = mongoose.model('CompetitionTeam', competitionTeamSchema)
