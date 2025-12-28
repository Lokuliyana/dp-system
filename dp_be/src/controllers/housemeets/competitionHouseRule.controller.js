const service = require('../../services/housemeets/competitionHouseRule.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.upsertHouseRule = asyncHandler(async (req, res) => {
  const rule = await service.upsertHouseRule({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(rule))
})

exports.getHouseRule = asyncHandler(async (req, res) => {
  const rule = await service.getHouseRule({
    schoolId: req.schoolId,
    competitionId: req.query.competitionId,
    year: req.query.year,
  })
  res.json(ApiResponse.ok(rule))
})
