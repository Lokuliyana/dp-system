const squadService = require('../../services/activities/squad.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createSquad = asyncHandler(async (req, res) => {
  const squad = await squadService.createSquad({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id
  })
  res.status(201).json(ApiResponse.created(squad))
})

exports.listSquads = asyncHandler(async (req, res) => {
  const items = await squadService.listSquads({
    schoolId: req.schoolId
  })
  res.json(ApiResponse.ok(items))
})

exports.updateSquad = asyncHandler(async (req, res) => {
  const squad = await squadService.updateSquad({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id
  })
  res.json(ApiResponse.ok(squad))
})

exports.deleteSquad = asyncHandler(async (req, res) => {
  await squadService.deleteSquad({
    schoolId: req.schoolId,
    id: req.params.id
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
