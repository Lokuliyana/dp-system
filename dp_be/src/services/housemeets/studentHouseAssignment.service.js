const StudentHouseAssignment = require('../../models/housemeets/studentHouseAssignment.model')
// const ApiError = require('../../utils/apiError')

/**
 * Assign (or re-assign) a student to a house for a given year.
 * If same student+year already exists, overwrite it (requirement F12).
 */
exports.assignStudentHouse = async ({ schoolId, payload, userId }) => {
  const {
    studentId,
    houseId,
    gradeId,
    year,
    assignedDate,
  } = payload

  const doc = await StudentHouseAssignment.findOneAndUpdate(
    { schoolId, studentId, year },
    {
      studentId,
      houseId,
      gradeId,
      year,
      assignedDate: assignedDate || new Date(),
      assignedById: userId,
      schoolId,
      updatedById: userId,
    },
    { new: true, upsert: true, runValidators: true }
  )

  return doc.toJSON()
}

exports.removeStudentHouse = async ({ schoolId, studentId, year }) => {
  const doc = await StudentHouseAssignment.findOneAndDelete({
    schoolId,
    studentId,
    year,
  })
  return doc ? doc.toJSON() : null
}

exports.bulkAssign = async ({ schoolId, assignments, year, userId }) => {
  const operations = assignments.map(async (assignment) => {
    if (assignment.houseId) {
      return exports.assignStudentHouse({
        schoolId,
        payload: {
          studentId: assignment.studentId,
          houseId: assignment.houseId,
          gradeId: assignment.gradeId,
          year,
        },
        userId,
      })
    } else {
      return exports.removeStudentHouse({
        schoolId,
        studentId: assignment.studentId,
        year,
      })
    }
  })

  return Promise.all(operations)
}

exports.listHouseAssignments = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.year) q.year = Number(filters.year)
  if (filters.gradeId) q.gradeId = filters.gradeId
  if (filters.houseId) q.houseId = filters.houseId
  if (filters.studentId) q.studentId = filters.studentId

  const items = await StudentHouseAssignment.find(q)
    .sort({ year: -1 })
    .lean()

  return items
}
