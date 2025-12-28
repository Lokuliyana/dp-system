const Prefect = require('../../models/staff/prefect.model')
const ApiError = require('../../utils/apiError')

function yearDup(err) {
  if (err?.code === 11000) {
    throw new ApiError(409, 'Prefect board already exists for this year')
  }
  throw err
}

exports.createPrefectYear = async ({ schoolId, payload, userId }) => {
  try {
    const doc = await Prefect.create({
      year: payload.year,
      appointedDate: payload.appointedDate || new Date(),
      students: [],
      schoolId,
      createdById: userId,
    })
    return doc.toJSON()
  } catch (err) {
    yearDup(err)
  }
}

exports.addPrefectStudent = async ({ schoolId, id, payload, userId }) => {
  const prefect = await Prefect.findOne({ _id: id, schoolId })
  if (!prefect) throw new ApiError(404, 'Prefect year not found')

  const exists = (prefect.students || []).some(
    (s) => String(s.studentId) === String(payload.studentId)
  )
  if (exists) throw new ApiError(409, 'Student already appointed in this year')

  prefect.students.push({
    studentId: payload.studentId,
    studentNameSi: payload.studentNameSi,
    studentNameEn: payload.studentNameEn,
    rank: payload.rank,
    positionIds: payload.positionIds || [],
  })

  prefect.updatedById = userId
  await prefect.save()

  return prefect.toJSON()
}

exports.updatePrefectStudent = async ({ schoolId, id, studentId, payload, userId }) => {
  const prefect = await Prefect.findOne({ _id: id, schoolId })
  if (!prefect) throw new ApiError(404, 'Prefect year not found')

  const idx = (prefect.students || []).findIndex(
    (s) => String(s.studentId) === String(studentId)
  )
  if (idx === -1) throw new ApiError(404, 'Prefect student not found')

  const current = prefect.students[idx]

  prefect.students[idx] = {
    ...current.toObject(),
    ...payload,
    studentId: current.studentId,
  }

  prefect.updatedById = userId
  await prefect.save()

  return prefect.toJSON()
}

exports.removePrefectStudent = async ({ schoolId, id, studentId, userId }) => {
  const prefect = await Prefect.findOne({ _id: id, schoolId })
  if (!prefect) throw new ApiError(404, 'Prefect year not found')

  const before = prefect.students.length
  prefect.students = prefect.students.filter(
    (s) => String(s.studentId) !== String(studentId)
  )

  if (prefect.students.length === before) {
    throw new ApiError(404, 'Prefect student not found')
  }

  prefect.updatedById = userId
  await prefect.save()

  return prefect.toJSON()
}

exports.listPrefects = async ({ schoolId, filters }) => {
  const q = { schoolId }
  if (filters.year) q.year = Number(filters.year)

  const items = await Prefect.find(q)
    .sort({ year: -1 })
    .lean()

  return items
}
