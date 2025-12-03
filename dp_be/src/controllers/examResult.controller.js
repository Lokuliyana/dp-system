const service = require('../services/examResult.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.createExamResultSheet = asyncHandler(async (req, res) => {
  const doc = await service.createExamResultSheet({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.upsertExamResults = asyncHandler(async (req, res) => {
  const doc = await service.upsertExamResults({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.listExamResultsByStudent = asyncHandler(async (req, res) => {
  const items = await service.listExamResultsByStudent({
    schoolId: req.schoolId,
    studentId: req.params.studentId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.listExamResultsByGrade = asyncHandler(async (req, res) => {
  const items = await service.listExamResultsByGrade({
    schoolId: req.schoolId,
    gradeId: req.params.gradeId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})
