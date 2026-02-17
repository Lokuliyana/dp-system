const mongoose = require('mongoose')
const TeamSelection = require('../../models/housemeets/teamSelection.model')
const Competition = require('../../models/housemeets/competition.model')
const CompetitionRegistration = require('../../models/housemeets/competitionRegistration.model')
const CompetitionResult = require('../../models/housemeets/competitionResult.model')
const ApiError = require('../../utils/apiError')

// Scoring for higher levels (Zonal, District, All-Island): 1st=5, 2nd=4, 3rd=3, 4th=2, 5th=1.
const MARKS_BY_PLACE = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 }

function computeTotalMarks(entries = [], level = 'zonal') {
  // If we ever need level-specific scoring, we can branch here.
  // For now, all higher levels (zonal, district, allisland) use MARKS_BY_PLACE.
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
 * Team Selection Suggestions:
 * - for zonal: take results/registrations from house meets
 * - for district: take 1st place from zonal selection
 * - for allisland: take 1st place from district selection
 */
exports.getTeamSelectionSuggestions = async ({ schoolId, year, level = 'zonal' }) => {
  const y = Number(year)

  if (level === 'district' || level === 'allisland') {
    const fromLevel = level === 'district' ? 'zonal' : 'district'
    const prev = await TeamSelection.findOne({ schoolId, level: fromLevel, year: y }).lean()
    
    if (!prev || !prev.entries?.length) return []

    // Suggest top winners from previous level (currently 1st place as per original requirement)
    const winners = prev.entries.filter(e => e.place === 1)
    
    // Populate student details for UI
    const results = await Promise.all(
      winners.map(async (w) => {
        const student = await mongoose.model('Student').findById(w.studentId).select('firstNameEn lastNameEn admissionNumber').lean()
        return {
          competitionId: w.competitionId,
          studentId: student || { _id: w.studentId },
          place: undefined // place at the NEW level is unknown
        }
      })
    )
    return results
  }

  // Zonal (original logic)
  const mains = await Competition.find({
    schoolId,
    year: y,
  }).lean()

  const mainCompetitionIds = mains.map((c) => c._id)

  const results = await CompetitionResult.find({
    schoolId,
    year: y,
    competitionId: { $in: mainCompetitionIds },
    place: { $lte: 5 },
    studentId: { $ne: null },
  })
    .sort({ competitionId: 1, place: 1 })
    .populate('studentId', 'firstNameEn lastNameEn admissionNumber')
    .lean()

  if (results.length > 0) {
    return results.map(r => ({
      competitionId: r.competitionId,
      studentId: r.studentId,
      place: r.place
    }))
  }

  const registrations = await CompetitionRegistration.find({
    schoolId,
    year: y,
    competitionId: { $in: mainCompetitionIds },
  })
    .populate('studentId', 'firstNameEn lastNameEn admissionNumber')
    .lean()

  return registrations.map(r => ({
    competitionId: r.competitionId,
    studentId: r.studentId,
    place: undefined
  }))
}


/**
 * Save/Update selection for any level.
 * If entries provided -> recompute totalMarks automatically (F22).
 */
exports.saveTeamSelection = async ({ schoolId, payload, userId }) => {
  const { level, year, entries = [], teamPosition } = payload

  enforceMaxThreePerStudent(entries)

  const totalMarks = computeTotalMarks(entries, level)

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
  })
    .populate('entries.studentId', 'firstNameEn lastNameEn admissionNumber')
    .lean()

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

  // Use only 1st place entries
  const nextEntries = prev.entries
    .filter((e) => e.place === 1)
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
