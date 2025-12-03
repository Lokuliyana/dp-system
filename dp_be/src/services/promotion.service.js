const Student = require('../models/student.model')
const Grade = require('../models/grade.model')
const Section = require('../models/section.model')
const ApiError = require('../utils/apiError')

/**
 * Derive section for a grade using Section.assignedGradeIds mapping.
 */
async function deriveSectionId({ schoolId, gradeId }) {
  const section = await Section.findOne({
    schoolId,
    assignedGradeIds: gradeId,
  }).lean()

  return section?._id || null
}

/**
 * Promote all students in fromYear to next grade level.
 * Rule implemented:
 *  - Find current grade level (Grade.level)
 *  - Next grade = level + 1 within same school
 *  - Update student.gradeId, student.sectionId (derived), student.academicYear
 * If next grade doesn't exist => skip (handled later by archive module).
 */
exports.promoteStudentsByDOB = async ({ schoolId, fromYear, toYear, userId, dryRun }) => {
  if (fromYear >= toYear) {
    throw new ApiError(400, 'toYear must be greater than fromYear')
  }

  // Load grade map for school
  const grades = await Grade.find({ schoolId }).lean()
  const gradeById = new Map(grades.map((g) => [String(g._id), g]))
  const gradeByLevel = new Map(grades.map((g) => [g.level, g]))

  const students = await Student.find({
    schoolId,
    academicYear: fromYear,
  })

  let promoted = 0
  let skippedNoNextGrade = 0
  let skippedMissingGrade = 0

  const bulkOps = []

  for (const s of students) {
    const currentGrade = gradeById.get(String(s.gradeId))
    if (!currentGrade) {
      skippedMissingGrade += 1
      continue
    }

    const nextGrade = gradeByLevel.get(currentGrade.level + 1)

    if (!nextGrade) {
      skippedNoNextGrade += 1
      continue
    }

    const nextSectionId = await deriveSectionId({
      schoolId,
      gradeId: nextGrade._id,
    })

    promoted += 1

    if (!dryRun) {
      bulkOps.push({
        updateOne: {
          filter: { _id: s._id, schoolId },
          update: {
            $set: {
              gradeId: nextGrade._id,
              sectionId: nextSectionId,
              academicYear: toYear,
              updatedById: userId,
            },
          },
        },
      })
    }
  }

  if (!dryRun && bulkOps.length) {
    await Student.bulkWrite(bulkOps)
  }

  return {
    fromYear,
    toYear,
    totalEligible: students.length,
    promoted,
    skippedNoNextGrade,
    skippedMissingGrade,
    dryRun: !!dryRun,
  }
}
