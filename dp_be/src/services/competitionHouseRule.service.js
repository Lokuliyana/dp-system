const CompetitionHouseRule = require('../models/competitionHouseRule.model')
// const ApiError = require('../utils/apiError')

exports.upsertHouseRule = async ({ schoolId, payload, userId }) => {
  const { competitionId, year, ...rest } = payload

  const updated = await CompetitionHouseRule.findOneAndUpdate(
    { schoolId, competitionId, year },
    { ...rest, competitionId, year, schoolId, updatedById: userId },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  )

  return updated.toJSON()
}

exports.getHouseRule = async ({ schoolId, competitionId, year }) => {
  const y = Number(year)

  const doc = await CompetitionHouseRule.findOne({
    schoolId,
    competitionId,
    year: y,
  }).lean()

  // If no override, return defaults as virtual rule (do not auto-create)
  if (!doc) {
    return {
      competitionId,
      year: y,
      maxPerHousePerGrade: 2,
      maxTotalPerGrade: 8,
      noteSi: null,
      noteEn: null,
      schoolId,
      isDefault: true,
    }
  }

  return { ...doc, isDefault: false }
}
