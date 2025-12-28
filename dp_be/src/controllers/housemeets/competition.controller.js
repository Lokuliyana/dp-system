const competitionService = require('../../services/housemeets/competition.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createCompetition = asyncHandler(async (req, res) => {
  const competition = await competitionService.createCompetition({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(competition))
})

exports.listCompetitions = asyncHandler(async (req, res) => {
  const items = await competitionService.listCompetitions({
    schoolId: req.schoolId,
    filters: req.query,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateCompetition = asyncHandler(async (req, res) => {
  const competition = await competitionService.updateCompetition({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(competition))
})

exports.deleteCompetition = asyncHandler(async (req, res) => {
  await competitionService.deleteCompetition({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
