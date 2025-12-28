const Section = require('../../models/system/section.model')
const ApiError = require('../../utils/apiError')

function handleDuplicate (err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Section name already exists in this school')
  }
  throw err
}

exports.createSection = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Section.create({
      ...payload,
      schoolId,
      createdById: userId // safe even if not in schema, mongoose ignores unless strict:false
    })
    return doc.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.listSections = async ({ schoolId }) => {
  const items = await Section.find({ schoolId })
    .sort({ createdAt: -1 })
    .lean()
  return items.map(item => ({ ...item, id: item._id }))
}

exports.listSectionsByGrade = async ({ schoolId, gradeId }) => {
  const items = await Section.find({
    schoolId,
    assignedGradeIds: gradeId
  })
    .sort({ nameEn: 1 })
    .lean()
  return items.map(item => ({ ...item, id: item._id }))
}

exports.updateSection = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Section.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    if (!updated) throw new ApiError(404, 'Section not found')
    return updated.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.deleteSection = async ({ schoolId, id }) => {
  const deleted = await Section.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Section not found')
  return true
}
