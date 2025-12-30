const service = require('../../services/housemeets/competitionRegistration.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.registerStudent = asyncHandler(async (req, res) => {
  const doc = await service.registerStudent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listRegistrations = asyncHandler(async (req, res) => {
  const items = await service.listRegistrations({
    schoolId: req.schoolId,
    filters: req.query,
    restrictedGradeIds: req.user.restrictedGradeIds,
  })
  res.json(ApiResponse.ok(items))
})


exports.deleteRegistration = asyncHandler(async (req, res) => {
  await service.deleteRegistration({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
