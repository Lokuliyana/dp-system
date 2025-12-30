const Student = require('../../models/student/student.model')
const Grade = require('../../models/system/grade.model')
const Teacher = require('../../models/staff/teacher.model')
const House = require('../../models/housemeets/house.model')
const TeamSelection = require('../../models/housemeets/teamSelection.model')
const Attendance = require('../../models/student/attendance.model')
const ExamResult = require('../../models/student/examResult.model')
const ApiError = require('../../utils/apiError')

exports.reportStudent = async ({ schoolId, studentId }) => {
  const student = await Student.findOne({ _id: studentId, schoolId }).lean()
  if (!student) throw new ApiError(404, 'Student not found')

  // Attendance Stats
  const totalDays = await Attendance.countDocuments({ schoolId, studentId })
  const presentDays = await Attendance.countDocuments({ schoolId, studentId, status: 'present' })
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  // Exam Results
  const examResults = await ExamResult.find({ schoolId, 'results.studentId': studentId }).lean()

  return {
    student,
    attendance: {
      total: totalDays,
      present: presentDays,
      percentage: attendancePercentage.toFixed(2),
    },
    examResults,
  }
}

exports.reportGrade = async ({ schoolId, gradeId, restrictedGradeIds }) => {
  if (restrictedGradeIds && !restrictedGradeIds.includes(gradeId.toString())) {
    throw new ApiError(403, 'You do not have permission to view reports for this grade')
  }

  const grade = await Grade.findOne({ _id: gradeId, schoolId }).lean()
  if (!grade) throw new ApiError(404, 'Grade not found')


  const studentCount = await Student.countDocuments({ schoolId, gradeId })

  return {
    grade,
    studentCount,
  }
}

exports.reportTeacher = async ({ schoolId, teacherId }) => {
  const teacher = await Teacher.findOne({ _id: teacherId, schoolId }).populate('roles').lean()
  if (!teacher) throw new ApiError(404, 'Teacher not found')

  return {
    teacher,
  }
}

exports.reportHouse = async ({ schoolId, houseId }) => {
  const house = await House.findOne({ _id: houseId, schoolId }).lean()
  if (!house) throw new ApiError(404, 'House not found')

  // const studentCount = await Student.countDocuments({ schoolId }) // This needs house assignment logic, simplified for now

  return {
    house,
    // points: ... (would need competition result aggregation)
  }
}

exports.reportTeams = async ({ schoolId }) => {
  const zonal = await TeamSelection.find({ schoolId, level: 'zonal' }).lean()
  const district = await TeamSelection.find({ schoolId, level: 'district' }).lean()
  const allisland = await TeamSelection.find({ schoolId, level: 'allisland' }).lean()

  return {
    zonal,
    district,
    allisland,
  }
}
