const Student = require('../../models/student/student.model')
const Grade = require('../../models/system/grade.model')
const Section = require('../../models/system/section.model')
const ApiError = require('../../utils/apiError')

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

  // 1. Ensure grades exist for toYear by duplicating from fromYear (or template)
  const existingToGrades = await Grade.find({ schoolId, academicYear: String(toYear) }).lean()
  
  if (existingToGrades.length === 0) {
    console.log(`[Promotion] No grades found for ${toYear}, duplicating from previous...`)
    // Try to find grades from fromYear, fallback to template ('')
    let sourceGrades = await Grade.find({ schoolId, academicYear: String(fromYear) }).lean()
    if (sourceGrades.length === 0) {
      sourceGrades = await Grade.find({ schoolId, academicYear: '' }).lean()
    }

    if (sourceGrades.length > 0 && !dryRun) {
      const newGrades = []
      for (const g of sourceGrades) {
        const { _id, createdAt, updatedAt, __v, ...rest } = g
        const newGrade = await Grade.create({
          ...rest,
          academicYear: String(toYear),
          createdById: userId,
          pastTeachers: g.classTeacherId ? [{ teacherId: g.classTeacherId, fromYear: fromYear }] : []
        })
        newGrades.push(newGrade)

        // Update sections that contained the source grade
        await Section.updateMany(
          { schoolId, assignedGradeIds: g._id },
          { $addToSet: { assignedGradeIds: newGrade._id } }
        )
      }
      console.log(`[Promotion] Duplicated ${newGrades.length} grades for ${toYear} and updated sections`)
    }
  }

  // 2. Load grade maps for the promotion logic
  const allGrades = await Grade.find({ schoolId }).lean()
  const gradeById = new Map(allGrades.map((g) => [String(g._id), g]))
  
  // We need a map of (level -> Grade) specifically for the toYear
  const toYearGradesByLevel = new Map(
    allGrades
      .filter(g => g.academicYear === String(toYear))
      .map(g => [g.level, g])
  )

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

    // Find the grade for the NEXT level in the TO year
    const nextGrade = toYearGradesByLevel.get(currentGrade.level + 1)

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
