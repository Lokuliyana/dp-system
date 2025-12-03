const service = require('../services/parent.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.createParent = asyncHandler(async (req, res) => {
  const doc = await service.createParent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listParents = asyncHandler(async (req, res) => {
  const items = await service.listParents({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.updateParent = asyncHandler(async (req, res) => {
  const doc = await service.updateParent({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteParent = asyncHandler(async (req, res) => {
  await service.deleteParent({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
