const Parent = require('../../models/student/parent.model')
const ApiError = require('../../utils/apiError')

exports.createParent = async ({ schoolId, payload, userId }) => {
  const doc = await Parent.create({
    ...payload,
    schoolId,
    createdById: userId,
  })
  return doc.toJSON()
}

exports.listParents = async ({ schoolId, filters = {} }) => {
  const query = { schoolId }
  const term = (filters.q || filters.name || '').trim()
  if (term) {
    query.$or = [
      { fullNameSi: { $regex: term, $options: 'i' } },
      { fullNameEn: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { phoneNum: { $regex: term, $options: 'i' } },
    ]
  }
  return await Parent.find(query).sort({ fullNameEn: 1 }).lean()
}

exports.updateParent = async ({ schoolId, id, payload, userId }) => {
  const updated = await Parent.findOneAndUpdate(
    { _id: id, schoolId },
    { ...payload, updatedById: userId },
    { new: true }
  )
  if (!updated) throw new ApiError(404, 'Parent not found')
  return updated.toJSON()
}

exports.deleteParent = async ({ schoolId, id }) => {
  const deleted = await Parent.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Parent not found')
  return true
}
