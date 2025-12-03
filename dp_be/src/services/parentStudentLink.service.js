const ParentStudentLink = require('../models/parentStudentLink.model')
const ApiError = require('../utils/apiError')

async function clearPrimaryIfNeeded({ schoolId, studentId }) {
  await ParentStudentLink.updateMany(
    { schoolId, studentId, isPrimary: true },
    { $set: { isPrimary: false } }
  )
}

exports.linkParentStudent = async ({ schoolId, payload, userId }) => {
  try {
    if (payload.isPrimary) {
      await clearPrimaryIfNeeded({ schoolId, studentId: payload.studentId })
    }

    const doc = await ParentStudentLink.create({
      ...payload,
      schoolId,
      createdById: userId,
    })

    return doc.toJSON()
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, 'Parent already linked to this student')
    }
    throw err
  }
}

exports.updateParentStudentLink = async ({ schoolId, id, payload, userId }) => {
  const current = await ParentStudentLink.findOne({ _id: id, schoolId })
  if (!current) throw new ApiError(404, 'Link not found')

  if (payload.isPrimary) {
    await clearPrimaryIfNeeded({ schoolId, studentId: current.studentId })
  }

  const updated = await ParentStudentLink.findOneAndUpdate(
    { _id: id, schoolId },
    { ...payload, updatedById: userId },
    { new: true }
  )

  return updated.toJSON()
}

exports.unlinkParentStudent = async ({ schoolId, id }) => {
  const deleted = await ParentStudentLink.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Link not found')
  return true
}
