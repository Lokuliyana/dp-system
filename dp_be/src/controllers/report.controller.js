const service = require('../services/report.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.reportStudent = asyncHandler(async (req, res) => {
  const data = await service.reportStudent({
    schoolId: req.schoolId,
    studentId: req.params.id,
  })
  res.json(ApiResponse.ok(data))
})

exports.reportGrade = asyncHandler(async (req, res) => {
  const data = await service.reportGrade({
    schoolId: req.schoolId,
    gradeId: req.params.id,
  })
  res.json(ApiResponse.ok(data))
})

exports.reportTeacher = asyncHandler(async (req, res) => {
  const data = await service.reportTeacher({
    schoolId: req.schoolId,
    teacherId: req.params.id,
  })
  res.json(ApiResponse.ok(data))
})

exports.reportHouse = asyncHandler(async (req, res) => {
  const data = await service.reportHouse({
    schoolId: req.schoolId,
    houseId: req.params.id,
  })
  res.json(ApiResponse.ok(data))
})

exports.reportTeams = asyncHandler(async (req, res) => {
  const data = await service.reportTeams({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(data))
})
