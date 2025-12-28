const Squad = require('../../models/activities/squad.model')
const ApiError = require('../../utils/apiError')

function handleDuplicate(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Squad already exists in this school')
  }
  throw err
}

exports.createSquad = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Squad.create({
      ...payload,
      schoolId,
      createdById: userId
    })
    return doc.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.listSquads = async ({ schoolId }) => {
  const items = await Squad.find({ schoolId }).sort({ nameEn: 1 }).lean()
  return items.map((item) => ({
    ...item,
    id: item._id.toString(),
  }))
}

exports.updateSquad = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Squad.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    if (!updated) throw new ApiError(404, 'Squad not found')
    return updated.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.deleteSquad = async ({ schoolId, id }) => {
  const deleted = await Squad.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Squad not found')
  return true
}
