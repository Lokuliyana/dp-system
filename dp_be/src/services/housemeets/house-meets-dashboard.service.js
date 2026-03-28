const Competition = require('../../models/housemeets/competition.model')
const CompetitionResult = require('../../models/housemeets/competitionResult.model')
const House = require('../../models/housemeets/house.model')
const Grade = require('../../models/system/grade.model')
const Student = require('../../models/student/student.model')
const competitionResultService = require('./competitionResult.service')
const mongoose = require('mongoose')
const dayjs = require('dayjs')

/**
 * Get data-rich stats for the House Meets (Competition) dashboard.
 */
exports.getHouseDashboardStats = async ({ schoolId, year }) => {
  const currentYear = year || dayjs().year()
  
  // 1. Consolidated House Points
  const housePoints = await competitionResultService.computeHousePoints({ schoolId, year: currentYear })
  
  // 2. Points Distribution by Grade (for Radar/Stacked Bar)
  const gradePointsAgg = await CompetitionResult.aggregate([
    {
      $match: {
        schoolId: new mongoose.Types.ObjectId(schoolId),
        year: currentYear
      }
    },
    {
      $group: {
        _id: { gradeId: '$gradeId', houseId: '$houseId' },
        points: { $sum: '$points' }
      }
    },
    {
       $lookup: {
         from: 'grades',
         localField: '_id.gradeId',
         foreignField: '_id',
         as: 'grade'
       }
    },
    { $unwind: '$grade' },
    {
       $lookup: {
         from: 'houses',
         localField: '_id.houseId',
         foreignField: '_id',
         as: 'house'
       }
    },
    { $unwind: '$house' },
    {
      $project: {
        gradeName: '$grade.nameEn',
        level: '$grade.level',
        houseName: '$house.nameEn',
        points: 1
      }
    },
    { $sort: { level: 1 } }
  ])

  // 3. Top Performers (MVP List)
  const mvpList = await CompetitionResult.aggregate([
    {
      $match: {
        schoolId: new mongoose.Types.ObjectId(schoolId),
        year: currentYear
      }
    },
    {
      $group: {
        _id: '$studentId',
        totalPoints: { $sum: '$points' },
        wins: { $sum: { $cond: [{ $eq: ['$place', 1] }, 1, 0] } }
      }
    },
    { $sort: { totalPoints: -1 } },
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
        from: 'houses',
        localField: 'student.houseId',
        foreignField: '_id',
        as: 'house'
      }
    },
    { $unwind: { path: '$house', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        studentId: '$_id',
        name: { $concat: ['$student.firstNameEn', ' ', '$student.lastNameEn'] },
        houseName: '$house.nameEn',
        houseColor: '$house.color',
        totalPoints: 1,
        wins: 1
      }
    }
  ])

  // 4. Activity Summary
  const [totalComps, completedComps] = await Promise.all([
    Competition.countDocuments({ schoolId, year: currentYear }),
    CompetitionResult.distinct('competitionId', { schoolId, year: currentYear }).then(ids => ids.length)
  ])

  return {
    housePoints,
    gradePoints: gradePointsAgg,
    mvpList,
    summary: {
      totalCompetitions: totalComps,
      completedCompetitions: completedComps,
      completionRate: totalComps > 0 ? (completedComps / totalComps) * 100 : 0,
      totalPointsAwarded: housePoints.reduce((acc, h) => acc + h.points, 0)
    }
  }
}
