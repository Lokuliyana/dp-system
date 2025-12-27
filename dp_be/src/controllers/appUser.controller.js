const service = require('../services/appUser.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.login = asyncHandler(async (req, res) => {
  const result = await service.login(req.body)
  res.json(ApiResponse.ok(result))
})

exports.refresh = asyncHandler(async (req, res) => {
  const result = await service.refresh({ token: req.body.token })
  res.json(ApiResponse.ok(result))
})

exports.me = asyncHandler(async (req, res) => {
  // req.user is already populated by auth middleware
  res.json(ApiResponse.ok(req.user))
})

exports.createAppUser = asyncHandler(async (req, res) => {
  const doc = await service.createAppUser({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listAppUsers = asyncHandler(async (req, res) => {
  const items = await service.listAppUsers({
    schoolId: req.schoolId,
  })
  res.json(ApiResponse.ok(items))
})

exports.updateAppUser = asyncHandler(async (req, res) => {
  const doc = await service.updateAppUser({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteAppUser = asyncHandler(async (req, res) => {
  await service.deleteAppUser({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
