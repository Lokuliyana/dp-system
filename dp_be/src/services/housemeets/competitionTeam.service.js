const CompetitionTeam = require('../../models/housemeets/competitionTeam.model')
const ApiError = require('../../utils/apiError')

function ensureUniqueMembers(memberStudentIds) {
  const set = new Set(memberStudentIds.map(String))
  if (set.size !== memberStudentIds.length) {
    throw new ApiError(400, 'Duplicate studentIds in team members')
  }
}

exports.createTeam = async ({ schoolId, payload, userId }) => {
  if (payload.memberStudentIds) ensureUniqueMembers(payload.memberStudentIds)

  const Competition = require('../../models/housemeets/competition.model')
  const competition = await Competition.findById(payload.competitionId).lean()

  // 1. Validate Team Size
  const size = payload.memberStudentIds.length
  const { minSize, maxSize } = competition.teamConfig || { minSize: 1, maxSize: 1 }
  if (size < minSize || size > maxSize) {
    throw new ApiError(400, `Team size must be between ${minSize} and ${maxSize}`)
  }

  // 2. Check Quota (similar to registration)
  // Fetch rule (reuse logic or duplicate for now)
  const CompetitionHouseRule = require('../../models/housemeets/competitionHouseRule.model')
  const rule = await CompetitionHouseRule.findOne({
    schoolId,
    competitionId: payload.competitionId,
    year: payload.year,
  }).lean() || { maxPerHousePerGrade: 2, maxTotalPerGrade: 8 } // Default

  if (payload.type === 'house') {
    let count = 0
    if (competition.scope === 'section') {
      const Grade = require('../../models/system/grade.model')
      const grade = await Grade.findById(payload.gradeId).lean()
      const sectionId = grade.sectionId
      const sectionGrades = await Grade.find({ sectionId, schoolId }).select('_id').lean()
      const sectionGradeIds = sectionGrades.map(g => g._id)

      count = await CompetitionTeam.countDocuments({
        schoolId,
        competitionId: payload.competitionId,
        year: payload.year,
        gradeId: { $in: sectionGradeIds },
        houseId: payload.houseId,
        type: 'house',
      })
    } else {
      count = await CompetitionTeam.countDocuments({
        schoolId,
        competitionId: payload.competitionId,
        year: payload.year,
        gradeId: payload.gradeId,
        houseId: payload.houseId,
        type: 'house',
      })
    }

    if (count >= rule.maxPerHousePerGrade) {
      throw new ApiError(409, `House team quota exceeded for this ${competition.scope === 'section' ? 'section' : 'grade'}`)
    }
  }

  const doc = await CompetitionTeam.create({
    ...payload,
    houseId: payload.type === 'independent' ? null : payload.houseId,
    schoolId,
    registeredById: userId,
  })

  return doc.toJSON()
}

exports.updateTeamMembers = async ({ schoolId, id, payload, userId }) => {
  if (payload.memberStudentIds) ensureUniqueMembers(payload.memberStudentIds)

  const updated = await CompetitionTeam.findOneAndUpdate(
    { _id: id, schoolId },
    {
      ...payload,
      houseId:
        payload.type === 'independent'
          ? null
          : payload.houseId, // if type changed
      updatedById: userId,
    },
    { new: true }
  )

  if (!updated) throw new ApiError(404, 'Team not found')
  return updated.toJSON()
}

exports.deleteTeam = async ({ schoolId, id }) => {
  const deleted = await CompetitionTeam.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Team not found')
  return true
}

exports.listTeams = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.competitionId) q.competitionId = filters.competitionId
  if (filters.year) q.year = Number(filters.year)
  if (filters.type) q.type = filters.type
  if (filters.houseId) q.houseId = filters.houseId
  if (filters.gradeId) q.gradeId = filters.gradeId

  const items = await CompetitionTeam.find(q)
    .sort({ year: -1 })
    .lean()

  return items
}
