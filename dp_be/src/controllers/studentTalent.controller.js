const service = require('../services/studentTalent.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.createStudentTalent = asyncHandler(async (req, res) => {
  const doc = await service.createStudentTalent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listStudentTalents = asyncHandler(async (req, res) => {
  const items = await service.listStudentTalents({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.updateStudentTalent = asyncHandler(async (req, res) => {
  const doc = await service.updateStudentTalent({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteStudentTalent = asyncHandler(async (req, res) => {
  await service.deleteStudentTalent({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
