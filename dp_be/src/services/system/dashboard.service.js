const Student = require('../../models/student/student.model')
const Grade = require('../../models/system/grade.model')
const Attendance = require('../../models/student/attendance.model')
const ExamMark = require('../../models/student/examMark.model')
const Exam = require('../../models/student/exam.model')
const Event = require('../../models/activities/event.model')
const OrganizationCalendar = require('../../models/system/organization-calendar.model')
const Teacher = require('../../models/staff/teacher.model')
const Competition = require('../../models/housemeets/competition.model')
const Section = require('../../models/system/section.model')
const competitionResultService = require('../housemeets/competitionResult.service')
const mongoose = require('mongoose')

/**
 * Get aggregated dashboard data with refined metrics and sections.
 */
exports.getDashboardData = async ({ schoolId }) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  
  const currentYear = today.getUTCFullYear()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30)
  
  // For the end of the range, we want to include anything marked for "today"
  const endOfToday = new Date(today)
  endOfToday.setUTCDate(today.getUTCDate() + 1)
  
  const startOfMonth = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1)
  const endOfRange = new Date(today)
  endOfRange.setUTCDate(today.getUTCDate() + 45) // Look ahead 45 days

  // 1. Fetch all Grades and Sections for mapping
  const allGrades = await Grade.find({ schoolId }).lean()
  const activeGrades = allGrades.filter(g => g.level < 14)
  const activeGradeIds = activeGrades.map(g => g._id)

  const allSections = await Section.find({ schoolId }).lean()
  // Filter sections that have at least one active grade
  const validSections = allSections.filter(sec => {
    return sec.assignedGradeIds.some(gid => 
      activeGrades.some(ag => String(ag._id) === String(gid))
    )
  }).map(sec => ({
    id: sec._id,
    nameEn: sec.nameEn,
    nameSi: sec.nameSi,
    gradeIds: sec.assignedGradeIds
  }))

  const studentCount = await Student.countDocuments({ 
    schoolId, 
    status: 'active', 
    gradeId: { $in: activeGradeIds } 
  })

  // 2. Staff Count
  const staffCount = await Teacher.countDocuments({ schoolId, status: 'active' })

  // 3. Competition Count (Current Year)
  const competitionCount = await Competition.countDocuments({ schoolId, year: currentYear })

  // 4. Refined Attendance Percentage (Average of daily percentages for past month)
  const dailyAttendance = await Attendance.aggregate([
    { 
      $match: { 
        schoolId: new mongoose.Types.ObjectId(schoolId), 
        date: { $gte: thirtyDaysAgo, $lt: endOfToday } 
      } 
    },
    {
      $group: {
        _id: '$date',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        percentage: { 
          $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$present', '$total'] }, 100] }] 
        }
      }
    }
  ])

  const attendanceAvg = dailyAttendance.length > 0 
    ? dailyAttendance.reduce((acc, d) => acc + d.percentage, 0) / dailyAttendance.length 
    : 0

  // 5. Performance by Grade (Combined Marks + Attendance)
  // Get attendance by grade
  const gradeAttendance = await Attendance.aggregate([
    { 
      $match: { 
        schoolId: new mongoose.Types.ObjectId(schoolId), 
        date: { $gte: thirtyDaysAgo, $lt: endOfToday } 
      } 
    },
    {
      $group: {
        _id: '$gradeId',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        gradeId: '$_id',
        avgAttendance: { 
          $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$present', '$total'] }, 100] }] 
        }
      }
    }
  ])

  // Get latest exam marks per grade
  const gradeExamAgg = await ExamMark.aggregate([
    { 
      $match: { 
        schoolId: new mongoose.Types.ObjectId(schoolId),
        gradeId: { $in: activeGradeIds.map(id => new mongoose.Types.ObjectId(id)) }
      } 
    },
    {
      $lookup: {
        from: 'exams',
        localField: 'examId',
        foreignField: '_id',
        as: 'exam'
      }
    },
    { $unwind: '$exam' },
    { $match: { 'exam.year': currentYear } },
    { $sort: { 'exam.date': -1, 'createdAt': -1 } },
    {
      $group: {
        _id: { gradeId: '$gradeId', examId: '$examId' },
        avgMark: { 
          $avg: { 
            $cond: [
              { $eq: ['$isPresent', true] }, 
              '$mark', 
              '$$REMOVE' 
            ] 
          } 
        },
        examDate: { $first: '$exam.date' }
      }
    },
    { $sort: { 'examDate': -1 } },
    {
      $group: {
        _id: '$_id.gradeId',
        avgMark: { $first: '$avgMark' }
      }
    }
  ])

  const gradeExamMap = {}
  gradeExamAgg.forEach(item => {
    gradeExamMap[item._id] = {
      avgMark: item.avgMark || 0
    }
  })

  // Combine grades, sections, attendance, and exams
  const gradePerformance = activeGrades.map(g => {
    const attendance = gradeAttendance.find(ga => String(ga.gradeId) === String(g._id))
    const exam = gradeExamMap[g._id]
    const section = validSections.find(sec => sec.gradeIds.some(gid => String(gid) === String(g._id)))

    return {
      gradeId: g._id,
      gradeNameEn: g.nameEn,
      gradeNameSi: g.nameSi,
      level: g.level,
      sectionId: section?.id || null,
      avgAttendance: attendance?.avgAttendance || 0,
      avgMark: exam?.avgMark || 0
    }
  }).sort((a, b) => a.level - b.level)

  // 6. House Points
  const housePoints = await competitionResultService.computeHousePoints({ schoolId, year: currentYear })

  // 7. Upcoming Events (Merging Events and Competitions)
  const [rawEvents, rawCompetitions] = await Promise.all([
    Event.find({ 
      schoolId: new mongoose.Types.ObjectId(schoolId), 
      date: { $gte: today } 
    }).sort({ date: 1 }).limit(10).lean(),
    Competition.find({ 
      schoolId: new mongoose.Types.ObjectId(schoolId), 
      date: { $gte: today } 
    }).sort({ date: 1 }).limit(10).lean()
  ])

  const upcomingEvents = [
    ...rawEvents.map(e => ({ ...e, eventType: e.eventType || 'Event' })),
    ...rawCompetitions.map(c => ({ 
      ...c, 
      eventType: 'Competition',
      // Ensure nameEn is used consistently as name
      nameEn: c.nameEn 
    }))
  ]
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .slice(0, 10)

  // 8. Special Days (Next 45 days instead of just current month)
  const specialDays = await OrganizationCalendar.find({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    date: { $gte: today, $lte: endOfRange },
    type: { $ne: 'Normal' }
  })
  .sort({ date: 1 })
  .lean()

  return {
    studentCount,
    staffCount,
    competitionCount,
    attendanceAvg,
    gradePerformance,
    sections: validSections,
    housePoints,
    upcomingEvents,
    specialDays
  }
}
