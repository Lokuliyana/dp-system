const Attendance = require('../../models/student/attendance.model')
const School = require('../../models/system/school.model')
const OrganizationCalendar = require('../../models/system/organization-calendar.model')
const ApiError = require('../../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Attendance already marked for this student on this date')
  }
  throw err
}

exports.markAttendance = async ({ schoolId, payload, userId }) => {
  try {
    const attendanceDate = new Date(payload.date)
    attendanceDate.setUTCHours(0, 0, 0, 0)
    const dayOfWeek = attendanceDate.getUTCDay()

    // 1. Get School Configuration
    const school = await School.findById(schoolId).select('attendanceConfig').lean()
    const config = school?.attendanceConfig || { allowedDayOfWeek: 0, startTime: '07:30', endTime: '13:00' }

    // 2. Get Organization Calendar Override
    const calendarEntry = await OrganizationCalendar.findOne({ schoolId, date: attendanceDate }).lean()
    
    const allowedDay = config.allowedDayOfWeek
    const startTimeStr = calendarEntry?.startTime || config.startTime
    const endTimeStr = calendarEntry?.endTime || config.endTime

    // Restriction 1: Must be the allowed day (unless overridden by calendar or config says any day)
    // If there's a calendar entry of type 'Sunday', 'SpecialDay', etc., we might allow it.
    // For now, let's stick to the specific day requirement unless it's a SpecialDay in calendar.
    const isSpecialDay = calendarEntry && ['Sunday', 'SpecialDay', 'SpecialEvent'].includes(calendarEntry.type)
    
    if (dayOfWeek !== allowedDay && !isSpecialDay) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      throw new ApiError(400, `Attendance can only be marked for ${days[allowedDay]}s`)
    }

    // Restriction 2: Time window
    const now = new Date()
    const isToday = attendanceDate.getUTCFullYear() === now.getUTCFullYear() &&
                    attendanceDate.getUTCMonth() === now.getUTCMonth() &&
                    attendanceDate.getUTCDate() === now.getUTCDate()

    if (isToday) {
      const [startH, startM] = startTimeStr.split(':').map(Number)
      const [endH, endM] = endTimeStr.split(':').map(Number)
      
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const currentTimeInMinutes = hours * 60 + minutes
      const startLimit = startH * 60 + startM
      const endLimit = endH * 60 + endM

      if (currentTimeInMinutes < startLimit || currentTimeInMinutes > endLimit) {
        throw new ApiError(400, `Attendance can only be marked between ${startTimeStr} and ${endTimeStr}`)
      }
    }

    const doc = await Attendance.create({
      ...payload,
      recordedById: userId,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    if (err instanceof ApiError) throw err
    dup(err)
  }
}

exports.updateAttendance = async ({ schoolId, id, payload, userId }) => {
  const existing = await Attendance.findOne({ _id: id, schoolId })
  if (!existing) throw new ApiError(404, 'Attendance record not found')

  const now = new Date()
  const attendanceDate = new Date(existing.date)
  attendanceDate.setUTCHours(0, 0, 0, 0)
  
  // Apply same time restrictions for updates if it's "today"
  const isToday = attendanceDate.getUTCFullYear() === now.getUTCFullYear() &&
                  attendanceDate.getUTCMonth() === now.getUTCMonth() &&
                  attendanceDate.getUTCDate() === now.getUTCDate()

  if (isToday) {
    const school = await School.findById(schoolId).select('attendanceConfig').lean()
    const config = school?.attendanceConfig || { allowedDayOfWeek: 0, startTime: '07:30', endTime: '13:00' }
    const calendarEntry = await OrganizationCalendar.findOne({ schoolId, date: attendanceDate }).lean()
    
    const startTimeStr = calendarEntry?.startTime || config.startTime
    const endTimeStr = calendarEntry?.endTime || config.endTime

    const [startH, startM] = startTimeStr.split(':').map(Number)
    const [endH, endM] = endTimeStr.split(':').map(Number)

    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTimeInMinutes = hours * 60 + minutes
    const startLimit = startH * 60 + startM
    const endLimit = endH * 60 + endM

    if (currentTimeInMinutes < startLimit || currentTimeInMinutes > endLimit) {
      throw new ApiError(400, `Attendance cannot be changed after ${endTimeStr}`)
    }
  } else {
    throw new ApiError(400, 'Attendance can only be modified on the respective allowed day within the time window')
  }

  const updated = await Attendance.findOneAndUpdate(
    { _id: id, schoolId },
    { status: payload.status, updatedById: userId },
    { new: true }
  )
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
