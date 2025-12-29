const service = require('../../services/system/role.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createRole = asyncHandler(async (req, res) => {
  const doc = await service.createRole({
    schoolId: req.schoolId,
    payload: req.body,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listRoles = asyncHandler(async (req, res) => {
  const items = await service.listRoles({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateRole = asyncHandler(async (req, res) => {
  const doc = await service.updateRole({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteRole = asyncHandler(async (req, res) => {
  await service.deleteRole({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
