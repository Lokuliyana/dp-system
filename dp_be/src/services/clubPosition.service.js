const ClubPosition = require('../models/clubPosition.model')
const ApiError = require('../utils/apiError')

function handleDup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Club position name already exists in this school')
  }
  throw err
}

exports.createClubPosition = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await ClubPosition.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.listClubPositions = async ({ schoolId }) => {
  const items = await ClubPosition.find({ schoolId })
    .sort({ nameEn: 1 })
    .lean()
  return items
}

exports.updateClubPosition = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await ClubPosition.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true, runValidators: true }
    )
    if (!updated) throw new ApiError(404, 'Club position not found')
    return updated.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.deleteClubPosition = async ({ schoolId, id }) => {
  const deleted = await ClubPosition.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Club position not found')
  return true
}
