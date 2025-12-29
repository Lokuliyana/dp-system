const Role = require('../../models/system/role.model')
const ApiError = require('../../utils/apiError')

exports.createRole = async ({ schoolId, payload }) => {
  const existing = await Role.findOne({
    schoolId,
    name: payload.name,
  })

  if (existing) throw new ApiError(409, 'Role with name already exists')

  const doc = await Role.create({
    ...payload,
    schoolId,
  })

  return doc.toJSON()
}

exports.listRoles = async ({ schoolId }) => {
  return await Role.find({ schoolId })
    .sort({ name: 1 })
    .lean()
}

exports.updateRole = async ({ schoolId, id, payload }) => {
  const updated = await Role.findOneAndUpdate(
    { _id: id, schoolId },
    payload,
    { new: true }
  )

  if (!updated) throw new ApiError(404, 'Role not found')

  return updated.toJSON()
}

exports.deleteRole = async ({ schoolId, id }) => {
  const deleted = await Role.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Role not found')
  return true
}
