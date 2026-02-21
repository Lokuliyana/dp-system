const Attendance = require('../../models/student/attendance.model')
const ExamMark = require('../../models/student/examMark.model')
const Exam = require('../../models/student/exam.model')
const Student = require('../../models/student/student.model')
const Grade = require('../../models/system/grade.model')
const ApiError = require('../../utils/apiError')
const mongoose = require('mongoose')

/**
 * Categorize a student based on attendance and marks.
 * @param {number} attendancePct 
 * @param {number} markAvg 
 * @returns {string} One of ['best', 'good', 'normal', 'weak']
 */
const categorize = (attendancePct, markAvg) => {
  if (attendancePct >= 90 && markAvg >= 75) return 'best'
  if (attendancePct >= 70 && markAvg >= 60) return 'good'
  if (attendancePct >= 40 && markAvg >= 40) return 'normal'
  return 'weak'
}

/**
 * Get analytics for a single student.
 */
exports.getStudentAnalytics = async ({ schoolId, studentId, year }) => {
  const y = year ? Number(year) : new Date().getFullYear()

  // 1. Get exams for this year
  const exams = await Exam.find({ schoolId, year: y }).select('_id').lean()
  const examIds = exams.map(e => e._id)

  // 2. Get attendance and marks in parallel
  const [attendanceStats, marks] = await Promise.all([
    Attendance.aggregate([
      { 
        $match: { 
          schoolId: new mongoose.Types.ObjectId(schoolId), 
          studentId: new mongoose.Types.ObjectId(studentId),
          // Extract year from date
          $expr: { $eq: [{ $year: '$date' }, y] }
        } 
      },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      }
    ]),
    ExamMark.find({
      schoolId,
      studentId,
      examId: { $in: examIds }
    }).lean()
  ])

  const attendance = attendanceStats[0] || { total: 0, present: 0 }
  const attendancePct = attendance.total > 0 ? (attendance.present / attendance.total) * 100 : 0

  let totalMarks = 0
  let examCount = 0
  
  marks.forEach(m => {
    // Only count marks where student was present? 
    // Usually if absent, it shouldn't pull down the average if we are measuring "potential".
    // But if we want a strict "academic performance", absence might be 0.
    // Given the current UI shows "markAvg", we'll count present exams.
    if (m.isPresent) {
        totalMarks += (m.mark || 0)
        examCount++
    }
  })

  const markAvg = examCount > 0 ? totalMarks / examCount : 0
  const category = categorize(attendancePct, markAvg)

  return {
    studentId,
    year: y,
    metrics: {
      attendancePct: Number(attendancePct.toFixed(2)),
      markAvg: Number(markAvg.toFixed(2)),
      attendanceCount: attendance.total,
      presentCount: attendance.present,
      examCount
    },
    category
  }
}

/**
 * Get analytics for a specific grade.
 */
exports.getGradeAnalytics = async ({ schoolId, gradeId, year }) => {
  const y = year ? Number(year) : new Date().getFullYear()

  // Find all active students in this grade
  const students = await Student.find({ schoolId, gradeId, status: 'active' }).select('_id').lean()
  const studentIds = students.map(s => s._id)

  if (studentIds.length === 0) {
    return {
      gradeId,
      year: y,
      studentCount: 0,
      distribution: { best: 0, good: 0, normal: 0, weak: 0 },
      averages: { attendancePct: 0, markAvg: 0 }
    }
  }

  // 1. Get exams for this year
  const exams = await Exam.find({ schoolId, year: y }).select('_id').lean()
  const examIds = exams.map(e => e._id)

  // 2. Get attendance and marks in parallel for ALL students in the grade
  const [attendanceStats, allMarks] = await Promise.all([
    Attendance.aggregate([
      { 
        $match: { 
          schoolId: new mongoose.Types.ObjectId(schoolId), 
          studentId: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) },
          $expr: { $eq: [{ $year: '$date' }, y] }
        } 
      },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
        }
      }
    ]),
    ExamMark.find({
      schoolId,
      studentId: { $in: studentIds },
      examId: { $in: examIds }
    }).lean()
  ])

  // Create lookup maps on studentId
  const attendanceMap = {}
  attendanceStats.forEach(stat => {
    attendanceMap[stat._id.toString()] = stat
  })

  const marksMap = {}
  allMarks.forEach(m => {
    const sId = m.studentId.toString()
    if (!marksMap[sId]) marksMap[sId] = []
    marksMap[sId].push(m)
  })

  const distribution = { best: 0, good: 0, normal: 0, weak: 0 }
  let totalAtt = 0
  let totalMarks = 0
  const studentAnalytics = []

  // Compute analytics per student locally
  studentIds.forEach(id => {
    const sId = id.toString()
    const attendance = attendanceMap[sId] || { total: 0, present: 0 }
    const attendancePct = attendance.total > 0 ? (attendance.present / attendance.total) * 100 : 0

    let sTotalMarks = 0
    let examCount = 0
    const studentMarks = marksMap[sId] || []
    
    studentMarks.forEach(m => {
      if (m.isPresent) {
        sTotalMarks += (m.mark || 0)
        examCount++
      }
    })

    const markAvg = examCount > 0 ? sTotalMarks / examCount : 0
    const category = categorize(attendancePct, markAvg)

    distribution[category]++
    totalAtt += attendancePct
    totalMarks += markAvg

    studentAnalytics.push({
      studentId: sId,
      year: y,
      metrics: {
        attendancePct: Number(attendancePct.toFixed(2)),
        markAvg: Number(markAvg.toFixed(2)),
        attendanceCount: attendance.total,
        presentCount: attendance.present,
        examCount
      },
      category
    })
  })

  return {
    gradeId,
    year: y,
    studentCount: studentIds.length,
    distribution,
    averages: {
      attendancePct: Number((totalAtt / studentIds.length).toFixed(2)),
      markAvg: Number((totalMarks / studentIds.length).toFixed(2))
    },
    studentDetails: studentAnalytics // Fast now
  }
}


/**
 * Get organization-wide analytics.
 */
exports.getOrganizationAnalytics = async ({ schoolId, year }) => {
  const y = year ? Number(year) : new Date().getFullYear()

  const grades = await Grade.find({ schoolId }).select('_id nameEn').lean()
  
  const gradeAnalytics = await Promise.all(
    grades.map(g => this.getGradeAnalytics({ schoolId, gradeId: g._id, year: y }))
  )

  const distribution = { best: 0, good: 0, normal: 0, weak: 0 }
  let totalStudents = 0
  let totalAtt = 0
  let totalMarks = 0

  gradeAnalytics.forEach(ga => {
    totalStudents += ga.studentCount
    distribution.best += ga.distribution.best
    distribution.good += ga.distribution.good
    distribution.normal += ga.distribution.normal
    distribution.weak += ga.distribution.weak
    // Note: This is an average of averages, not perfectly accurate weighted average
    // But for a high-level view it's often sufficient. 
    // For weighting:
    totalAtt += ga.averages.attendancePct * ga.studentCount
    totalMarks += ga.averages.markAvg * ga.studentCount
  })

  return {
    year: y,
    totalStudents,
    distribution,
    averages: {
      attendancePct: totalStudents > 0 ? Number((totalAtt / totalStudents).toFixed(2)) : 0,
      markAvg: totalStudents > 0 ? Number((totalMarks / totalStudents).toFixed(2)) : 0
    },
    gradeWise: gradeAnalytics.map(ga => ({
      gradeId: ga.gradeId,
      gradeName: grades.find(g => g._id.toString() === ga.gradeId.toString())?.nameEn,
      studentCount: ga.studentCount,
      distribution: ga.distribution,
      averages: ga.averages
    }))
  }
}
