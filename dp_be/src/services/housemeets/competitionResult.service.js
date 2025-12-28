const CompetitionResult = require('../../models/housemeets/competitionResult.model')
const ApiError = require('../../utils/apiError')

const POINTS_BY_PLACE = {
  1: 15,
  2: 10,
  3: 5,
}

function validateResultsPayload(results) {
  const set = new Set(results.map((r) => r.place))
  if (set.size !== results.length) {
    throw new ApiError(400, 'Duplicate places in results payload')
  }
}

exports.recordResults = async ({ schoolId, payload, userId }) => {
  const { competitionId, year, results } = payload

  validateResultsPayload(results)

  // Upsert each place
  const ops = results.map((r) => ({
    updateOne: {
      filter: { schoolId, competitionId, year, place: r.place },
      update: {
        $set: {
          ...r,
          personalAwardWinners: r.personalAwardWinners || [],
          competitionId,
          year,
          schoolId,
          updatedById: userId,
        },
      },
      upsert: true,
    },
  }))

  await CompetitionResult.bulkWrite(ops)

  const saved = await CompetitionResult.find({ schoolId, competitionId, year })
    .sort({ place: 1 })
    .lean()

  return saved.map((item) => ({
    ...item,
    id: item._id.toString(),
  }))
}

exports.listResults = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.competitionId) q.competitionId = filters.competitionId
  if (filters.year) q.year = Number(filters.year)
  if (filters.place !== undefined) q.place = Number(filters.place)
  if (filters.gradeId) q.gradeId = filters.gradeId
  if (filters.houseId) q.houseId = filters.houseId

  const items = await CompetitionResult.find(q)
    .sort({ year: -1, place: 1 })
    .lean()

  return items.map((item) => ({
    ...item,
    id: item._id.toString(),
  }))
}

exports.removeResultEntry = async ({ schoolId, id }) => {
  const deleted = await CompetitionResult.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Result entry not found')
  return true
}

/**
 * Computes annual house points based on results:
 * 1st=15, 2nd=10, 3rd=5 only.
 * Returns points per house for given year.
 */
exports.computeHousePoints = async ({ schoolId, year }) => {
  const y = Number(year)

  const results = await CompetitionResult.find({
    schoolId,
    year: y,
    place: { $in: [1, 2, 3] },
    houseId: { $ne: null },
  }).lean()

  const totals = {}
  for (const r of results) {
    const hid = String(r.houseId)
    totals[hid] = (totals[hid] || 0) + (POINTS_BY_PLACE[r.place] || 0)
  }

  // Convert to array for easy UI use
  return Object.entries(totals)
    .map(([houseId, points]) => ({ houseId, points }))
    .sort((a, b) => b.points - a.points)
}
