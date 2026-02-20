const service = require('../../services/activities/club.service')
const asyncHandler = require('../../middlewares/asyncHandler')
const ApiResponse = require('../../utils/apiResponse')

exports.createClub = asyncHandler(async (req, res) => {
  const doc = await service.createClub({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listClubs = asyncHandler(async (req, res) => {
  const items = await service.listClubs({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.updateClub = asyncHandler(async (req, res) => {
  const doc = await service.updateClub({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteClub = asyncHandler(async (req, res) => {
  await service.deleteClub({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})

exports.assignPosition = asyncHandler(async (req, res) => {
  const doc = await service.assignPosition({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.removeMember = asyncHandler(async (req, res) => {
  const doc = await service.removeMember({
    schoolId: req.schoolId,
    id: req.params.id,
    studentId: req.params.studentId,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})
exports.bulkAssignMembers = asyncHandler(async (req, res) => {
  const doc = await service.bulkAssignMembers({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})
