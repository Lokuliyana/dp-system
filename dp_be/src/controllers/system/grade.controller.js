const gradeService = require('../../services/system/grade.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')
const ApiError = require('../../utils/apiError')

exports.createGrade = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'User not authenticated'))
  }

  const grade = await gradeService.createGrade({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(grade))
})

exports.listGradesWithStats = asyncHandler(async (req, res) => {
  const items = await gradeService.listGradesWithStats({
    schoolId: req.schoolId,
    year: req.query.year,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateGrade = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'User not authenticated'))
  }

  const grade = await gradeService.updateGrade({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(grade))
})

exports.deleteGrade = asyncHandler(async (req, res) => {
  await gradeService.deleteGrade({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
