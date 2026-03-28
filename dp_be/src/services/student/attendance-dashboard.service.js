const Attendance = require('../../models/student/attendance.model')
const School = require('../../models/system/school.model')
const Student = require('../../models/student/student.model')
const Grade = require('../../models/system/grade.model')
const mongoose = require('mongoose')
const dayjs = require('dayjs')

/**
 * Get data-rich stats for the attendance dashboard.
 */
exports.getAttendanceDashboardStats = async ({ schoolId, startDate, endDate }) => {
  const sDate = startDate ? dayjs(startDate).startOf('day').toDate() : dayjs().subtract(30, 'day').startOf('day').toDate()
  const eDate = endDate ? dayjs(endDate).endOf('day').toDate() : dayjs().endOf('day').toDate()

  const match = {
    schoolId: new mongoose.Types.ObjectId(schoolId),
    date: { $gte: sDate, $lte: eDate }
  }

  // 1. Daily Trend Data
  const dailyTrend = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$date',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        present: 1,
        absent: 1,
        late: 1,
        total: 1,
        rate: { 
          $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$present', '$total'] }, 100] }] 
        }
      }
    }
  ])

  // 2. Grade-wise Breakdown
  const gradeStats = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$gradeId',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'grades',
        localField: '_id',
        foreignField: '_id',
        as: 'grade'
      }
    },
    { $unwind: '$grade' },
    {
      $project: {
        gradeId: '$_id',
        gradeName: '$grade.nameEn',
        level: '$grade.level',
        rate: { 
          $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$present', '$total'] }, 100] }] 
        }
      }
    },
    { $sort: { level: 1 } }
  ])

  // 3. Chronic Absentees (Intervention List)
  // Students who were absent > 3 times in the selected period
  const interventionList = await Attendance.aggregate([
    { $match: match },
    { $match: { status: 'absent' } },
    {
      $group: {
        _id: '$studentId',
        absentCount: { $sum: 1 }
      }
    },
    { $match: { absentCount: { $gte: 3 } } },
    { $sort: { absentCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $lookup: {
        from: 'grades',
        localField: 'student.gradeId',
        foreignField: '_id',
        as: 'grade'
      }
    },
    { $unwind: '$grade' },
    {
      $project: {
        studentId: '$_id',
        name: { $concat: ['$student.firstNameEn', ' ', '$student.lastNameEn'] },
        gradeName: '$grade.nameEn',
        absentCount: 1,
        phone: '$student.contactNo'
      }
    }
  ])

  return {
    dailyTrend,
    gradeStats,
    interventionList,
    summary: {
      totalRecords: dailyTrend.reduce((acc, d) => acc + d.total, 0),
      avgRate: dailyTrend.length > 0 ? dailyTrend.reduce((acc, d) => acc + d.rate, 0) / dailyTrend.length : 0
    }
  }
}
