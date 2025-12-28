const StaffRole = require('../../models/staff/staffRole.model')
const ApiError = require('../../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Role name already exists in this school')
  }
  throw err
}

exports.createStaffRole = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await StaffRole.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.listStaffRoles = async ({ schoolId }) => {
  const items = await StaffRole.find({ schoolId })
    .sort({ order: 1, nameEn: 1 })
    .lean()
  return items.map((item) => ({ ...item, id: item._id?.toString?.() }))
}

exports.updateStaffRole = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await StaffRole.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true, runValidators: true }
    )
    if (!updated) throw new ApiError(404, 'Staff role not found')
    return updated.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.deleteStaffRole = async ({ schoolId, id }) => {
  const deleted = await StaffRole.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Staff role not found')
  return true
}
