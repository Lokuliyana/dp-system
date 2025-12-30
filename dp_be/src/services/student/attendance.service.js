const Attendance = require('../../models/student/attendance.model')
const ApiError = require('../../utils/apiError')

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

exports.listAttendanceByDate = async ({ schoolId, date, gradeId, restrictedGradeIds }) => {
  const q = {
    schoolId,
    date: new Date(date),
  }
  
  if (restrictedGradeIds) {
    const mongoose = require('mongoose')
    const allowedIds = restrictedGradeIds.map(id => new mongoose.Types.ObjectId(id))
    if (gradeId) {
      q.gradeId = restrictedGradeIds.includes(gradeId.toString()) ? gradeId : { $in: [] }
    } else {
      q.gradeId = { $in: allowedIds }
    }
  } else if (gradeId) {
    q.gradeId = gradeId
  }


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

exports.getAttendanceStats = async ({ schoolId, startDate, endDate, gradeId, restrictedGradeIds }) => {
  const match = {
    schoolId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }
  
  if (restrictedGradeIds) {
    if (gradeId) {
      match.gradeId = restrictedGradeIds.includes(gradeId.toString()) ? gradeId : { $in: [] }
    } else {
      match.gradeId = { $in: restrictedGradeIds }
    }
  } else if (gradeId) {
    match.gradeId = gradeId
  }

  const stats = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: '$date',
          gradeId: '$gradeId',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          date: '$_id.date',
          gradeId: '$_id.gradeId'
        },
        present: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'present'] }, '$count', 0]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'absent'] }, '$count', 0]
          }
        },
        late: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'late'] }, '$count', 0]
          }
        },
        total: { $sum: '$count' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ])

  return stats.map(s => ({
    date: s._id.date,
    gradeId: s._id.gradeId,
    present: s.present,
    absent: s.absent,
    late: s.late,
    total: s.total
  }))
}

exports.listAttendanceByRange = async ({ schoolId, startDate, endDate, gradeId, restrictedGradeIds }) => {
  const q = {
    schoolId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }
  
  if (restrictedGradeIds) {
    if (gradeId) {
      q.gradeId = restrictedGradeIds.includes(gradeId.toString()) ? gradeId : { $in: [] }
    } else {
      q.gradeId = { $in: restrictedGradeIds }
    }
  } else if (gradeId) {
    q.gradeId = gradeId
  }


  const items = await Attendance.find(q).sort({ date: 1, studentId: 1 }).lean()
  return items
}
