const StudentTalent = require('../../models/student/studentTalent.model')
const ApiError = require('../../utils/apiError')

function handleDup(err) {
  if (err?.code === 11000) {
    throw new ApiError(
      409,
      'Talent already exists for this student for the given year'
    )
  }
  throw err
}

exports.createStudentTalent = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await StudentTalent.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.listStudentTalents = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.studentId) q.studentId = filters.studentId
  if (filters.year) q.year = Number(filters.year)

  const items = await StudentTalent.find(q)
    .sort({ year: -1, talentName: 1 })
    .lean()

  return items
}

exports.updateStudentTalent = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await StudentTalent.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    if (!updated) throw new ApiError(404, 'Student talent not found')
    return updated.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.deleteStudentTalent = async ({ schoolId, id }) => {
  const deleted = await StudentTalent.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Student talent not found')
  return true
}
