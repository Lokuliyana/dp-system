const Student = require('../models/student.model')
const ApiError = require('../utils/apiError')

// other models for 360 view (some may be added later)
const Attendance = require('../models/attendance.model')
const ExamResult = require('../models/examResult.model')
const StudentHouseAssignment = require('../models/studentHouseAssignment.model')
const CompetitionRegistration = require('../models/competitionRegistration.model')
const CompetitionResult = require('../models/competitionResult.model')
const CompetitionTeam = require('../models/competitionTeam.model')
const TeamSelection = require('../models/teamSelection.model')
const Club = require('../models/club.model')
const Prefect = require('../models/prefect.model')
const EventRegistration = require('../models/eventRegistration.model')
const StudentTalent = require('../models/studentTalent.model')

function handleDup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Admission number already exists in this school')
  }
  throw err
}

exports.createStudent = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Student.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.listStudentsByGrade = async ({ schoolId, gradeId, academicYear }) => {
  const q = { schoolId, gradeId }
  if (academicYear) q.academicYear = Number(academicYear)

  const items = await Student.find(q)
    .sort({ admissionNumber: 1 })
    .lean()

  return items.map(item => ({ ...item, id: item._id }))
}

exports.updateStudentBasicInfo = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true, runValidators: true }
    )
    if (!updated) throw new ApiError(404, 'Student not found')
    return updated.toJSON()
  } catch (err) {
    handleDup(err)
  }
}

exports.deleteStudent = async ({ schoolId, id }) => {
  const deleted = await Student.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Student not found')
  return true
}

exports.addStudentNote = async ({ schoolId, id, payload, userId }) => {
  const student = await Student.findOne({ _id: id, schoolId })
  if (!student) throw new ApiError(404, 'Student not found')

  student.notes.push({
    createdById: userId,
    category: payload.category || 'other',
    content: payload.content,
  })

  await student.save()
  return student.toJSON()
}

exports.removeStudentNote = async ({ schoolId, id, noteId }) => {
  const student = await Student.findOne({ _id: id, schoolId })
  if (!student) throw new ApiError(404, 'Student not found')

  const before = student.notes.length
  student.notes = student.notes.filter((n) => String(n._id) !== String(noteId))

  if (student.notes.length === before) {
    throw new ApiError(404, 'Note not found')
  }

  await student.save()
  return student.toJSON()
}

/**
 * Student 360 view (year-wise aggregation).
 * Returns a composed object using other collections.
 * If some collections are empty/not yet used, arrays return empty.
 */
exports.getStudent360 = async ({ schoolId, id, year }) => {
  const student = await Student.findOne({ _id: id, schoolId }).lean()
  if (!student) throw new ApiError(404, 'Student not found')

  const y = year ? Number(year) : undefined

  const [
    attendance,
    examResults,
    houseHistory,
    competitions,
    competitionWins,
    teams,
    higherTeams,
    clubs,
    prefectHistory,
    events,
    talents,
  ] = await Promise.all([
    Attendance.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    ExamResult.find({
      schoolId,
      ...(y ? { year: y } : {}),
      'results.studentId': id,
    }).lean(),

    StudentHouseAssignment.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    CompetitionRegistration.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    CompetitionResult.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    CompetitionTeam.find({
      schoolId,
      memberStudentIds: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    TeamSelection.find({
      schoolId,
      ...(y ? { year: y } : {}),
      'entries.studentId': id,
    }).lean(),

    Club.find({
      schoolId,
      'members.studentId': id,
    }).lean(),

    Prefect.find({
      schoolId,
      ...(y ? { year: y } : {}),
      'students.studentId': id,
    }).lean(),

    EventRegistration.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),

    StudentTalent.find({
      schoolId,
      studentId: id,
      ...(y ? { year: y } : {}),
    }).lean(),
  ])

  return {
    student,
    attendance,
    examResults,
    houseHistory,
    competitions,
    competitionWins,
    teams,
    higherTeams,
    clubs,
    prefectHistory,
    events,
    talents,
  }
}
