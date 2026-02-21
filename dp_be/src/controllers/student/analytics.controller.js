const service = require('../../services/student/analytics.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.getStudentAnalytics = asyncHandler(async (req, res) => {
  const data = await service.getStudentAnalytics({
    schoolId: req.schoolId,
    studentId: req.params.id,
    year: req.query.year
  })
  res.json(ApiResponse.ok(data))
})

exports.getGradeAnalytics = asyncHandler(async (req, res) => {
  const data = await service.getGradeAnalytics({
    schoolId: req.schoolId,
    gradeId: req.params.id,
    year: req.query.year
  })
  res.json(ApiResponse.ok(data))
})

exports.getOrganizationAnalytics = asyncHandler(async (req, res) => {
  const data = await service.getOrganizationAnalytics({
    schoolId: req.schoolId,
    year: req.query.year
  })
  res.json(ApiResponse.ok(data))
})
