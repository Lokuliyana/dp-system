const service = require('../../services/housemeets/competitionTeam.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createTeam = asyncHandler(async (req, res) => {
  const team = await service.createTeam({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(team))
})

exports.listTeams = asyncHandler(async (req, res) => {
  const items = await service.listTeams({
    schoolId: req.schoolId,
    filters: req.query,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateTeamMembers = asyncHandler(async (req, res) => {
  const team = await service.updateTeamMembers({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(team))
})

exports.deleteTeam = asyncHandler(async (req, res) => {
  await service.deleteTeam({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
