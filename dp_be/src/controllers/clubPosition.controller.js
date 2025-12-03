const service = require('../services/clubPosition.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.createClubPosition = asyncHandler(async (req, res) => {
  const doc = await service.createClubPosition({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listClubPositions = asyncHandler(async (req, res) => {
  const items = await service.listClubPositions({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateClubPosition = asyncHandler(async (req, res) => {
  const doc = await service.updateClubPosition({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteClubPosition = asyncHandler(async (req, res) => {
  await service.deleteClubPosition({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
