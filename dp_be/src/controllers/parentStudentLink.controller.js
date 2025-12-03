const service = require('../services/parentStudentLink.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.linkParentStudent = asyncHandler(async (req, res) => {
  const doc = await service.linkParentStudent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.updateParentStudentLink = asyncHandler(async (req, res) => {
  const doc = await service.updateParentStudentLink({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.unlinkParentStudent = asyncHandler(async (req, res) => {
  await service.unlinkParentStudent({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ unlinked: true }))
})
