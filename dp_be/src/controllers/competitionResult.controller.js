const service = require('../services/competitionResult.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.recordResults = asyncHandler(async (req, res) => {
  const items = await service.recordResults({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(items))
})

exports.listResults = asyncHandler(async (req, res) => {
  const items = await service.listResults({
    schoolId: req.schoolId,
    filters: req.query,
  })
  res.json(ApiResponse.ok(items))
})

exports.removeResultEntry = asyncHandler(async (req, res) => {
  await service.removeResultEntry({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})

exports.computeHousePoints = asyncHandler(async (req, res) => {
  const items = await service.computeHousePoints({
    schoolId: req.schoolId,
    year: req.query.year,
  })
  res.json(ApiResponse.ok(items))
})
