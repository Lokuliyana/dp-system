const TeacherHouseAssignment = require('../../models/housemeets/teacherHouseAssignment.model')
// const ApiError = require('../../utils/apiError')

/**
 * Assign or update a teacher's house.
 * Each teacher can only have ONE active house.
 */
exports.assignTeacherHouse = async ({ schoolId, payload, userId }) => {
  const { teacherId, houseId, assignedDate } = payload

  const doc = await TeacherHouseAssignment.findOneAndUpdate(
    { schoolId, teacherId },
    {
      teacherId,
      houseId,
      assignedDate: assignedDate || new Date(),
      assignedById: userId,
      schoolId,
      updatedById: userId,
    },
    { new: true, upsert: true }
  )

  return doc.toJSON()
}

exports.listTeacherHouseAssignments = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.teacherId) q.teacherId = filters.teacherId
  if (filters.houseId) q.houseId = filters.houseId

  const items = await TeacherHouseAssignment.find(q)
    .sort({ teacherId: 1 })
    .lean()

  return items
}
