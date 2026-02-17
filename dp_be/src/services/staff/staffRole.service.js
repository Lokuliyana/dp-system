const StaffRole = require('../../models/staff/staffRole.model')
const Role = require('../../models/system/role.model')
const ApiError = require('../../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Role name already exists in this school')
  }
  throw err
}

exports.createStaffRole = async ({ schoolId, payload, userId }) => {
  try {
    // 1. Create System Role first
    const systemRole = await Role.create({
      name: payload.nameEn,
      description: payload.descriptionEn,
      schoolId,
    })

    // 2. Create Staff Role linked to System Role
    const doc = await StaffRole.create({
      ...payload,
      systemRoleId: systemRole._id,
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

    // Sync System Role
    if (payload.nameEn || payload.descriptionEn) {
      await Role.findOneAndUpdate(
        { _id: updated.systemRoleId, schoolId },
        { 
          name: updated.nameEn, 
          description: updated.descriptionEn 
        }
      )
    }

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
