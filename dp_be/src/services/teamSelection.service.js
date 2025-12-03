const TeamSelection = require('../models/teamSelection.model')
const Competition = require('../models/competition.model')
const CompetitionRegistration = require('../models/competitionRegistration.model')
const CompetitionResult = require('../models/competitionResult.model')
const ApiError = require('../utils/apiError')

// F22 scoring: 1st=5, 2nd=4, 3rd=3, 4th=2, 5th=1. :contentReference[oaicite:2]{index=2}
const MARKS_BY_PLACE = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 }

function computeTotalMarks(entries = []) {
  return entries.reduce((sum, e) => {
    const p = e.place
    return sum + (MARKS_BY_PLACE[p] || 0)
  }, 0)
}

function enforceMaxThreePerStudent(entries = []) {
  const counts = {}
  for (const e of entries) {
    const sid = String(e.studentId)
    counts[sid] = (counts[sid] || 0) + 1
    if (counts[sid] > 3) {
      throw new ApiError(400, 'One student cannot be in more than 3 competitions')
    }
  }
}

/**
 * F21 Suggestions:
 * - take 1st place from each MAIN competition (41) for given year
 * - fallback to registered students if no results yet
 */
exports.getZonalSuggestions = async ({ schoolId, year }) => {
  const y = Number(year)

  const mains = await Competition.find({
    schoolId,
    year: y,
    // isMainCompetition: true, // Removed per user clarification: Main != Zonal qualifier
  }).lean()

  const mainCompetitionIds = mains.map((c) => c._id)

  const firstPlaces = await CompetitionResult.find({
    schoolId,
    year: y,
    competitionId: { $in: mainCompetitionIds },
    place: 1,
    studentId: { $ne: null },
  }).lean()

  if (firstPlaces.length) {
    return firstPlaces.map((r) => ({
      competitionId: r.competitionId,
      studentId: r.studentId,
      place: 1,
    }))
  }

  // fallback: registered students for main competitions
  const regs = await CompetitionRegistration.find({
    schoolId,
    year: y,
    competitionId: { $in: mainCompetitionIds },
  }).lean()

  // pick first registered per competition
  const picked = {}
  for (const r of regs) {
    const cid = String(r.competitionId)
    if (!picked[cid]) picked[cid] = r.studentId
  }

  return Object.entries(picked).map(([competitionId, studentId]) => ({
    competitionId,
    studentId,
  }))
}

/**
 * Save/Update selection for any level.
 * If entries provided -> recompute totalMarks automatically (F22).
 */
exports.saveTeamSelection = async ({ schoolId, payload, userId }) => {
  const { level, year, entries = [], teamPosition } = payload

  enforceMaxThreePerStudent(entries)

  const totalMarks = computeTotalMarks(entries)

  const updated = await TeamSelection.findOneAndUpdate(
    { schoolId, level, year },
    {
      $set: {
        level,
        year,
        entries,
        totalMarks,
        ...(teamPosition !== undefined ? { teamPosition } : {}),
        schoolId,
        updatedById: userId,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  return updated.toJSON()
}

/**
 * Get selection for a level/year.
 */
exports.getSelection = async ({ schoolId, level, year }) => {
  const doc = await TeamSelection.findOne({
    schoolId,
    level,
    year: Number(year),
  }).lean()

  return doc || null
}

/**
 * F22 helper:
 * recompute totalMarks from stored entries (if admin updated places later)
 */
exports.computeTeamTotalMarks = async ({ schoolId, level, year, userId }) => {
  const doc = await TeamSelection.findOne({ schoolId, level, year: Number(year) })
  if (!doc) throw new ApiError(404, 'Team selection not found')

  doc.totalMarks = computeTotalMarks(doc.entries)
  doc.updatedById = userId
  await doc.save()

  return doc.toJSON()
}

/**
 * F23/F24:
 * Auto-generate next level from previous level 1st places.
 * - zonal -> district (F23)
 * - district -> allisland (F24)
 */
exports.autoGenerateNextLevel = async ({
  schoolId,
  fromLevel,
  toLevel,
  year,
  userId,
}) => {
  if (fromLevel === toLevel) {
    throw new ApiError(400, 'fromLevel and toLevel cannot be the same')
  }

  const prev = await TeamSelection.findOne({
    schoolId,
    level: fromLevel,
    year,
  }).lean()

  if (!prev) throw new ApiError(404, 'Previous level selection not found')

  // Use only 1st place entries (or entries without place if not set yet)
  const nextEntries = prev.entries
    .filter((e) => e.place === 1 || e.place === undefined)
    .map((e) => ({
      competitionId: e.competitionId,
      studentId: e.studentId,
      place: undefined,
    }))

  enforceMaxThreePerStudent(nextEntries)

  const totalMarks = computeTotalMarks(nextEntries)

  const updated = await TeamSelection.findOneAndUpdate(
    { schoolId, level: toLevel, year },
    {
      $set: {
        level: toLevel,
        year,
        entries: nextEntries,
        totalMarks,
        schoolId,
        updatedById: userId,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  return updated.toJSON()
}
