const service = require('../../services/staff/prefectPosition.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createPrefectPosition = asyncHandler(async (req, res) => {
  const doc = await service.createPrefectPosition({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listPrefectPositions = asyncHandler(async (req, res) => {
  const items = await service.listPrefectPositions({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updatePrefectPosition = asyncHandler(async (req, res) => {
  const doc = await service.updatePrefectPosition({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deletePrefectPosition = asyncHandler(async (req, res) => {
  await service.deletePrefectPosition({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
