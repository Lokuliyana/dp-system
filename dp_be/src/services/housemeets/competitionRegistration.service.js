const CompetitionRegistration = require('../../models/housemeets/competitionRegistration.model')
const CompetitionHouseRule = require('../../models/housemeets/competitionHouseRule.model')
const ApiError = require('../../utils/apiError')

// Fetch rule or use defaults (F17)
async function getRule(schoolId, competitionId, year) {
  const doc = await CompetitionHouseRule.findOne({
    schoolId,
    competitionId,
    year,
  }).lean()

  if (!doc) {
    return {
      maxPerHousePerGrade: 2,
      maxTotalPerGrade: 8,
    }
  }
  return doc
}

// QUOTA CHECK
async function checkQuota({ schoolId, competitionId, gradeId, houseId, year, mode }) {
  const rule = await getRule(schoolId, competitionId, year)
  const Competition = require('../../models/housemeets/competition.model')
  const competition = await Competition.findById(competitionId).lean()

  if (mode === 'house') {
    let count = 0

    if (competition.scope === 'section') {
      // For section scope, we need to count registrations for ALL grades in this section
      // First, find which section this grade belongs to (or use competition.sectionIds)
      // Assuming competition.sectionIds contains the relevant sections and we want to limit per section.
      // But the requirement says "from each section from each house only 2".
      // So we need to find all grades in the section that 'gradeId' belongs to.

      const Grade = require('../../models/system/grade.model')
      const grade = await Grade.findById(gradeId).lean()
      const sectionId = grade.sectionId

      // Find all grades in this section
      const sectionGrades = await Grade.find({ sectionId, schoolId }).select('_id').lean()
      const sectionGradeIds = sectionGrades.map(g => g._id)

      count = await CompetitionRegistration.countDocuments({
        schoolId,
        competitionId,
        year,
        gradeId: { $in: sectionGradeIds },
        houseId,
        mode: 'house',
      })
    } else if (competition.scope === 'open') {
      // For open scope, count all registrations for this competition regardless of grade
      count = await CompetitionRegistration.countDocuments({
        schoolId,
        competitionId,
        year,
        houseId,
        mode: 'house',
      })
    } else {
      // Default: Grade scope
      count = await CompetitionRegistration.countDocuments({
        schoolId,
        competitionId,
        year,
        gradeId,
        houseId,
        mode: 'house',
      })
    }

    let maxLimit = rule.maxPerHousePerGrade
    if (competition.participationType === 'team' && competition.teamConfig?.maxSize) {
      maxLimit = competition.teamConfig.maxSize
    }

    if (count >= maxLimit) {
      throw new ApiError(409, `House quota exceeded for this ${competition.scope === 'section' ? 'section' : 'grade'} (Limit: ${maxLimit})`)
    }
  }

  if (mode === 'independent') {
    // Independent quota logic remains similar, but could also be scoped if needed.
    // For now, keeping it simple or applying same logic if requested.
    // Requirement says "if scope section from each section from each house only 2".
    // Independent usually doesn't have house limit, but total limit.

    const total = await CompetitionRegistration.countDocuments({
      schoolId,
      competitionId,
      year,
      gradeId,
    })

    if (total >= rule.maxTotalPerGrade) {
      throw new ApiError(409, 'Total grade quota exceeded for this competition')
    }
  }
}

exports.registerStudent = async ({ schoolId, payload, userId }) => {
  const { competitionId, gradeId, houseId, mode, year } = payload

  // mode Validation (houseId only for house)
  if (mode === 'independent' && houseId) {
    throw new ApiError(400, 'Independent mode cannot include houseId')
  }
  if (mode === 'house' && !houseId) {
    throw new ApiError(400, 'House mode requires houseId')
  }



  try {
    const doc = await CompetitionRegistration.create({
      ...payload,
      houseId: mode === 'independent' ? null : houseId,
      schoolId,
      registeredById: userId,
    })
    await doc.populate('studentId', 'firstNameEn lastNameEn admissionNumber fullNameSi firstNameSi lastNameSi fullNameEn nameWithInitialsSi')
    return doc.toJSON()
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, 'Student already registered for this competition')
    }
    throw err
  }
}

exports.listRegistrations = async ({ schoolId, filters, restrictedGradeIds }) => {
  const q = { schoolId }

  if (filters.competitionId) q.competitionId = filters.competitionId
  if (filters.year) q.year = Number(filters.year)
  if (filters.mode) q.mode = filters.mode
  if (filters.houseId) q.houseId = filters.houseId

  if (restrictedGradeIds) {
    if (filters.gradeId) {
      q.gradeId = restrictedGradeIds.includes(filters.gradeId.toString()) ? filters.gradeId : { $in: [] }
    } else {
      q.gradeId = { $in: restrictedGradeIds }
    }
  } else if (filters.gradeId) {
    q.gradeId = filters.gradeId
  }

  const items = await CompetitionRegistration.find(q)
    .populate('studentId', 'firstNameEn lastNameEn admissionNumber fullNameSi firstNameSi lastNameSi fullNameEn nameWithInitialsSi')
    .sort({ year: -1 })
    .lean()

  return items
}


exports.deleteRegistration = async ({ schoolId, id }) => {
  const deleted = await CompetitionRegistration.findOneAndDelete({
    _id: id,
    schoolId,
  })

  if (!deleted) throw new ApiError(404, 'Registration not found')
  return true
}
