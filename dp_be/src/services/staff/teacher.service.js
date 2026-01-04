const Teacher = require('../../models/staff/teacher.model')
const Role = require('../../models/system/role.model')
const AppUser = require('../../models/system/appUser.model')
const ApiError = require('../../utils/apiError')
const bcrypt = require('bcryptjs')

async function syncAppUser(teacher, schoolId, userId) {

  // 2. Find existing AppUser for this teacher
  let appUser = await AppUser.findOne({ teacherId: teacher._id, schoolId })

  const userData = {
    name: `${teacher.firstNameEn} ${teacher.lastNameEn}`.trim(),
    email: teacher.email || undefined,
    phone: teacher.phone || undefined,
    roleIds: [staffRole._id],
    teacherId: teacher._id,
    schoolId,
    isActive: teacher.status === 'active',
  }

  if (appUser) {
    // Update existing user
    // We don't change password on sync
    await AppUser.findOneAndUpdate(
      { _id: appUser._id },
      { ...userData, updatedById: userId },
      { runValidators: true }
    )
  } else {
    // Create new user
    const defaultPassword = teacher.firstNameEn.toLowerCase()
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    await AppUser.create({
      ...userData,
      password: hashedPassword,
      createdById: userId,
    })
  }
}

exports.createTeacher = async ({ schoolId, payload, userId }) => {
  const doc = await Teacher.create({
    ...payload,
    schoolId,
    createdById: userId,
  })

  // Sync AppUser
  await syncAppUser(doc, schoolId, userId)

  return doc.toJSON()
}

exports.listTeachers = async ({ schoolId, filters }) => {
  const q = { schoolId }

  if (filters.status) q.status = filters.status
  if (filters.roleId) q.roleIds = filters.roleId

  if (filters.search) {
    const s = filters.search.trim()
    q.$or = [
      { fullNameEn: { $regex: s, $options: 'i' } },
      { fullNameSi: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
    ]
  }

  const items = await Teacher.find(q)
    .sort({ fullNameEn: 1 })
    .lean()

  return items.map((item) => ({ ...item, id: item._id?.toString?.() }))
}

exports.updateTeacher = async ({ schoolId, id, payload, userId }) => {
  const updated = await Teacher.findOneAndUpdate(
    { _id: id, schoolId },
    { ...payload, updatedById: userId },
    { new: true, runValidators: true }
  )

  if (!updated) throw new ApiError(404, 'Teacher not found')

  // Sync AppUser
  await syncAppUser(updated, schoolId, userId)

  return updated.toJSON()
}

exports.deleteTeacher = async ({ schoolId, id }) => {
  const deleted = await Teacher.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'Teacher not found')

  // Delete associated AppUser
  await AppUser.findOneAndDelete({ teacherId: id, schoolId })

  return true
}


/**
 * Append a past role entry.
 * If same role already exists without toYear, close it first.
 */
exports.appendPastRole = async ({ schoolId, id, payload, userId }) => {
  const teacher = await Teacher.findOne({ _id: id, schoolId })
  if (!teacher) throw new ApiError(404, 'Teacher not found')

  // close open pastRole with same roleId
  teacher.pastRoles = (teacher.pastRoles || []).map((r) => {
    if (
      String(r.roleId) === String(payload.roleId) &&
      !r.toYear &&
      payload.fromYear >= r.fromYear
    ) {
      return { ...r.toObject(), toYear: payload.fromYear }
    }
    return r
  })

  teacher.pastRoles.push(payload)
  teacher.updatedById = userId

  await teacher.save()
  return teacher.toJSON()
}
