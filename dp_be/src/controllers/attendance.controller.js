const service = require('../services/attendance.service')
const asyncHandler = require('../middlewares/asyncHandler')
const ApiResponse = require('../utils/apiResponse')

exports.markAttendance = asyncHandler(async (req, res) => {
  const doc = await service.markAttendance({
    schoolId: req.schoolId,
    payload: req.body,
    userId: req.user.id,
  })
  res.status(201).json(ApiResponse.created(doc))
})

exports.updateAttendance = asyncHandler(async (req, res) => {
  const doc = await service.updateAttendance({
    schoolId: req.schoolId,
    id: req.params.id,
    payload: req.body,
    userId: req.user.id,
  })
  res.json(ApiResponse.ok(doc))
})

exports.listAttendanceByDate = asyncHandler(async (req, res) => {
  const items = await service.listAttendanceByDate({
    schoolId: req.schoolId,
    date: req.query.date,
    gradeId: req.query.gradeId,
  })
  res.json(ApiResponse.ok(items))
})

exports.listAttendanceByStudent = asyncHandler(async (req, res) => {
  const items = await service.listAttendanceByStudent({
    schoolId: req.schoolId,
    studentId: req.params.studentId,
    filters: req.query || {},
  })
  res.json(ApiResponse.ok(items))
})

exports.deleteAttendance = asyncHandler(async (req, res) => {
  await service.deleteAttendance({
    schoolId: req.schoolId,
    id: req.params.id,
  })
  res.json(ApiResponse.ok({ deleted: true }))
})

exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const stats = await service.getAttendanceStats({
    schoolId: req.schoolId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    gradeId: req.query.gradeId,
  })
  res.json(ApiResponse.ok(stats))
})

exports.listAttendanceByRange = asyncHandler(async (req, res) => {
  const items = await service.listAttendanceByRange({
    schoolId: req.schoolId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    gradeId: req.query.gradeId,
  })
  res.json(ApiResponse.ok(items))
})
