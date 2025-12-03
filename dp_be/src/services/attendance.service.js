const Attendance = require('../models/attendance.model')
const ApiError = require('../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Attendance already marked for this student on this date')
  }
  throw err
}

exports.markAttendance = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Attendance.create({
      ...payload,
      recordedById: userId,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.updateAttendance = async ({ schoolId, id, payload, userId }) => {
  const updated = await Attendance.findOneAndUpdate(
    { _id: id, schoolId },
    { status: payload.status, updatedById: userId },
    { new: true }
  )
  if (!updated) throw new ApiError(404, 'Attendance record not found')
  return updated.toJSON()
}

exports.listAttendanceByDate = async ({ schoolId, date, gradeId }) => {
  const q = {
    schoolId,
    date: new Date(date),
  }
  if (gradeId) q.gradeId = gradeId

  const items = await Attendance.find(q).sort({ studentId: 1 }).lean()

  return items
}

exports.listAttendanceByStudent = async ({ schoolId, studentId, filters }) => {
  const q = {
    schoolId,
    studentId,
  }

  if (filters.startDate) q.date = { $gte: new Date(filters.startDate) }
  if (filters.endDate) q.date = { ...(q.date || {}), $lte: new Date(filters.endDate) }

  const items = await Attendance.find(q).sort({ date: -1 }).lean()

  return items
}

exports.deleteAttendance = async ({ schoolId, id }) => {
  const deleted = await Attendance.findOneAndDelete({
    _id: id,
    schoolId,
  })
  if (!deleted) throw new ApiError(404, 'Attendance record not found')
  return true
}
