const service = require('../services/teamSelection.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.getZonalSuggestions = asyncHandler(async (req, res) => {
  const items = await service.getZonalSuggestions({
    schoolId: req.schoolId,
    year: req.query.year,
  })
  res.json(ApiResponse.ok(items))
})

exports.saveTeamSelection = asyncHandler(async (req, res) => {
  const doc = await service.saveTeamSelection({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.getSelection = asyncHandler(async (req, res) => {
  const doc = await service.getSelection({
    schoolId: req.schoolId,
    level: req.query.level,
    year: req.query.year,
  })
  res.json(ApiResponse.ok(doc))
})

exports.computeTeamTotalMarks = asyncHandler(async (req, res) => {
  const doc = await service.computeTeamTotalMarks({
    schoolId: req.schoolId,
    level: req.body.level,
    year: req.body.year,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.autoGenerateNextLevel = asyncHandler(async (req, res) => {
  const doc = await service.autoGenerateNextLevel({
    schoolId: req.schoolId,
    fromLevel: req.body.fromLevel,
    toLevel: req.body.toLevel,
    year: req.body.year,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})
