const service = require('../../services/staff/staffRole.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createStaffRole = asyncHandler(async (req, res) => {
  const doc = await service.createStaffRole({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listStaffRoles = asyncHandler(async (req, res) => {
  const items = await service.listStaffRoles({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateStaffRole = asyncHandler(async (req, res) => {
  const doc = await service.updateStaffRole({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteStaffRole = asyncHandler(async (req, res) => {
  await service.deleteStaffRole({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
