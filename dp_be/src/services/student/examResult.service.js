const ExamResult = require('../../models/student/examResult.model')
const ApiError = require('../../utils/apiError')

function duplicateToConflict(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Exam result sheet already exists for this year/term/grade')
  }
  throw err
}

// F8-ish for exams: create empty sheet
exports.createExamResultSheet = async ({ schoolId, payload, userId }) => {
  const { year, term, gradeId } = payload

  try {
    const doc = await ExamResult.create({
      year,
      term,
      gradeId,
      results: [],
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    duplicateToConflict(err)
  }
}

// Bulk upsert results into the sheet (create if missing)
exports.upsertExamResults = async ({ schoolId, payload, userId }) => {
  const { year, term, gradeId, results } = payload

  const sheet = await ExamResult.findOneAndUpdate(
    { schoolId, year, term, gradeId },
    {
      $set: {
        results,
        updatedById: userId,
      },
    },
    { new: true, upsert: true }
  )

  return sheet.toJSON()
}

// View all results for a specific student (optionally filter)
exports.listExamResultsByStudent = async ({ schoolId, studentId, filters }) => {
  const q = { schoolId }
  if (filters.year) q.year = Number(filters.year)
  if (filters.term) q.term = Number(filters.term)

  const sheets = await ExamResult.find(q)
    .select('year term gradeId results')
    .populate('gradeId', 'nameEn nameSi level')
    .lean()

  const items = []
  for (const s of sheets) {
    const r = (s.results || []).find((x) => x.studentId.toString() === studentId)
    if (r) {
      items.push({
        year: s.year,
        term: s.term,
        grade: s.gradeId,
        mark: r.mark,
        gradingSchemaId: r.gradingSchemaId,
      })
    }
  }

  // sort oldest -> newest
  items.sort((a, b) => (a.year - b.year) || (a.term - b.term))
  return items
}

// View sheet(s) for grade (optionally filter)
exports.listExamResultsByGrade = async ({ schoolId, gradeId, filters }) => {
  const q = { schoolId, gradeId }
  if (filters.year) q.year = Number(filters.year)
  if (filters.term) q.term = Number(filters.term)

  const sheets = await ExamResult.find(q)
    .sort({ year: -1, term: -1 })
    .lean()

  return sheets
}
