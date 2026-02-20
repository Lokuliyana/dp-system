const Club = require('../../models/activities/club.model')
const ApiError = require('../../utils/apiError')

function dup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Club already exists for this year')
  }
  throw err
}

exports.createClub = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Club.create({
      ...payload,
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.listClubs = async ({ schoolId, filters }) => {
  const q = { schoolId }
  if (filters?.year) q.year = Number(filters.year)

  const items = await Club.find(q)
    .populate('members.studentId', 'firstNameEn lastNameEn fullNameSi nameWithInitialsSi admissionNumber')
    .populate('members.positionId', 'nameEn nameSi')
    .sort({ nameEn: 1 })
    .lean()

  return items
}

exports.updateClub = async ({ schoolId, id, payload, userId }) => {
  try {
    const updated = await Club.findOneAndUpdate(
      { _id: id, schoolId },
      { ...payload, updatedById: userId },
      { new: true }
    )
    if (!updated) throw new ApiError(404, 'Club not found')
    return updated.toJSON()
  } catch (err) {
    dup(err)
  }
}

exports.deleteClub = async ({ schoolId, id }) => {
  const deleted = await Club.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Club not found')
  return true
}

/**
 * Assign/update/remove a student's position in a club.
 */
exports.assignPosition = async ({ schoolId, id, payload, userId }) => {
  const club = await Club.findOne({ _id: id, schoolId })
  if (!club) throw new ApiError(404, 'Club not found')

  const { studentId, positionId } = payload

  // remove any existing entry for this student
  club.members = (club.members || []).filter(
    (m) => String(m.studentId) !== String(studentId)
  )

  // re-add if setting a position
  club.members.push({
    studentId,
    positionId: positionId || null,
  })

  club.updatedById = userId
  await club.save()

  return await Club.findById(club._id)
    .populate('members.studentId', 'firstNameEn lastNameEn nameWithInitialsSi admissionNumber')
    .populate('members.positionId', 'nameEn nameSi')
    .lean()
}

exports.removeMember = async ({ schoolId, id, studentId, userId }) => {
  const club = await Club.findOne({ _id: id, schoolId })
  if (!club) throw new ApiError(404, 'Club not found')

  club.members = (club.members || []).filter(
    (m) => String(m.studentId) !== String(studentId)
  )

  club.updatedById = userId
  await club.save()

  return await Club.findById(club._id)
    .populate('members.studentId', 'firstNameEn lastNameEn nameWithInitialsSi admissionNumber')
    .populate('members.positionId', 'nameEn nameSi')
    .lean()
}
exports.bulkAssignMembers = async ({ schoolId, id, payload, userId }) => {
  const club = await Club.findOne({ _id: id, schoolId })
  if (!club) throw new ApiError(404, 'Club not found')

  const { assignments } = payload // Array of { studentId, positionId }

  // Create a map of existing members for quick lookup
  const memberMap = new Map()
  ;(club.members || []).forEach(m => {
    memberMap.set(String(m.studentId), m)
  })

  // Apply assignments
  assignments.forEach(({ studentId, positionId }) => {
    memberMap.set(String(studentId), {
      studentId,
      positionId: positionId || null
    })
  })

  club.members = Array.from(memberMap.values())
  club.updatedById = userId
  await club.save()

  return await Club.findById(club._id)
    .populate('members.studentId', 'firstNameEn lastNameEn nameWithInitialsSi admissionNumber')
    .populate('members.positionId', 'nameEn nameSi')
    .lean()
}
