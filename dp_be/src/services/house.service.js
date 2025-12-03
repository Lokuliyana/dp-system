const House = require('../models/house.model')
const ApiError = require('../utils/apiError')

function handleDuplicate(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'House name already exists in this school')
  }
  throw err
}

exports.createHouse = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await House.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.listHouses = async ({ schoolId }) => {
  const items = await House.find({ schoolId })
    .sort({ nameEn: 1 })
    .lean()
  return items.map((item) => ({
    ...item,
    id: item._id.toString(),
  }))
}

exports.updateHouse = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await House.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )

    if (!updated) throw new ApiError(404, 'House not found')
    return updated.toJSON()
  } catch (err) {
    handleDuplicate(err)
  }
}

exports.deleteHouse = async ({ schoolId, id }) => {
  const deleted = await House.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'House not found')
  return true
}
