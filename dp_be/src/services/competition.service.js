const Competition = require('../models/competition.model')
const ApiError = require('../utils/apiError')

function handleDuplicate(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Competition already exists for this squad/year')
  }
  throw err
}

exports.createCompetition = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Competition.create({
      ...payload,
      personalAwards: payload.personalAwards || [],
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.listCompetitions = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.squadId) q.squadId = filters.squadId
  if (filters.year) q.year = Number(filters.year)
  if (filters.scope) q.scope = filters.scope
  if (filters.isMainCompetition !== undefined) {
    q.isMainCompetition = filters.isMainCompetition === 'true'
  }

  const items = await Competition.find(q)
    .sort({ year: -1, nameEn: 1 })
    .lean()

  return items
}

exports.updateCompetition = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Competition.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    if (!updated) throw new ApiError(404, 'Competition not found')
    return updated.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.deleteCompetition = async ({ schoolId, id }) => {
  const deleted = await Competition.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Competition not found')
  return true
}
