const PrefectPosition = require('../models/prefectPosition.model')
const ApiError = require('../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Prefect position already exists in this school')
  }
  throw err
}

exports.createPrefectPosition = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await PrefectPosition.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.listPrefectPositions = async ({ schoolId }) => {
  const items = await PrefectPosition.find({ schoolId })
    .sort({ rankLevel: 1, nameEn: 1 })
    .lean()
  return items
}

exports.updatePrefectPosition = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await PrefectPosition.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )
    if (!updated) throw new ApiError(404, 'Prefect position not found')
    return updated.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.deletePrefectPosition = async ({ schoolId, id }) => {
  const deleted = await PrefectPosition.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Prefect position not found')
  return true
}
