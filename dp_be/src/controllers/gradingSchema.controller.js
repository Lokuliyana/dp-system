const service = require('../services/gradingSchema.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.createGradingSchema = asyncHandler(async (req, res) => {
  const doc = await service.createGradingSchema({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listGradingSchemas = asyncHandler(async (req, res) => {
  const items = await service.listGradingSchemas({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateGradingSchema = asyncHandler(async (req, res) => {
  const doc = await service.updateGradingSchema({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteGradingSchema = asyncHandler(async (req, res) => {
  await service.deleteGradingSchema({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
