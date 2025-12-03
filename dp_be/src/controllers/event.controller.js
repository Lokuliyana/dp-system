const service = require('../services/event.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

/* -------------------- EVENT CRUD -------------------- */

exports.createEvent = asyncHandler(async (req, res) => {
  const doc = await service.createEvent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.listEvents = asyncHandler(async (req, res) => {
  const items = await service.listEvents({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.updateEvent = asyncHandler(async (req, res) => {
  const doc = await service.updateEvent({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.deleteEvent = asyncHandler(async (req, res) => {
  await service.deleteEvent({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})

/* -------------------- REGISTRATION -------------------- */

exports.registerStudentForEvent = asyncHandler(async (req, res) => {
  const doc = await service.registerStudentForEvent({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.listEventRegistrations = asyncHandler(async (req, res) => {
  const items = await service.listEventRegistrations({
    schoolId: req.schoolId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.deleteEventRegistration = asyncHandler(async (req, res) => {
  await service.deleteEventRegistration({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})
