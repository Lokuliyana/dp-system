const service = require('../../services/staff/prefect.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createPrefectYear = asyncHandler(async (req, res) => {
  const doc = await service.createPrefectYear({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.addPrefectStudent = asyncHandler(async (req, res) => {
  const doc = await service.addPrefectStudent({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.updatePrefectStudent = asyncHandler(async (req, res) => {
  const doc = await service.updatePrefectStudent({
    schoolId: req.schoolId,
    id: req.params.id,
    studentId: req.params.studentId,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.removePrefectStudent = asyncHandler(async (req, res) => {
  const doc = await service.removePrefectStudent({
    schoolId: req.schoolId,
    id: req.params.id,
    studentId: req.params.studentId,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.listPrefects = asyncHandler(async (req, res) => {
  const items = await service.listPrefects({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})
