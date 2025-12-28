const service = require('../../services/staff/teacher.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createTeacher = async (req, res, next) => {
  try {
    const doc = await service.createTeacher({
      schoolId: req.schoolId,
      payload: req.body,
      userId: req.user.id,
    })
    res.status(201).json(ApiResponse.created(doc))
  } catch (err) {
    next(err)
  }
}

exports.listTeachers = asyncHandler(async (req, res) => {
  const items = await service.listTeachers({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.updateTeacher = asyncHandler(async (req, res) => {
  const doc = await service.updateTeacher({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteTeacher = asyncHandler(async (req, res) => {
  await service.deleteTeacher({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})

exports.appendPastRole = asyncHandler(async (req, res) => {
  const doc = await service.appendPastRole({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})
