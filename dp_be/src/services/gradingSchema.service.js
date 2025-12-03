const GradingSchema = require('../models/gradingSchema.model')
const ApiError = require('../utils/apiError')

function handleDuplicate(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Grading schema with this name already exists')
  }
  throw err
}

exports.createGradingSchema = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await GradingSchema.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.listGradingSchemas = async ({ schoolId }) => {
  const items = await GradingSchema.find({ schoolId })
    .sort({ name: 1 })
    .lean()
  return items
}

exports.updateGradingSchema = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await GradingSchema.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    if (!updated) throw new ApiError(404, 'Grading schema not found')
    return updated.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.deleteGradingSchema = async ({ schoolId, id }) => {
  const deleted = await GradingSchema.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Grading schema not found')
  return true
}
