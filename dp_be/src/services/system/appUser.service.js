const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AppUser = require('../../models/system/appUser.model')
// const RolePermission = require('../../models/rolePermission.model')
const ApiError = require('../../utils/apiError')
const env = require('../../config/env')

function generateTokens(appUser) {
  const payload = {
    id: appUser._id,
    schoolId: appUser.schoolId,
    roleIds: appUser.roleIds,
  }

  const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  })

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  })

  return { accessToken, refreshToken }
}

/* -------------------- AUTH -------------------- */

exports.login = async ({ identifier, password }) => {
  const user = await AppUser.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier }
    ]
  })
  if (!user) throw new ApiError(401, 'Invalid credentials')

  if (password) {
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new ApiError(401, 'Invalid credentials')
  }

  const tokens = generateTokens(user)
  return { user, ...tokens }
}

exports.refresh = async ({ token }) => {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret)
    const user = await AppUser.findById(decoded.id)
    if (!user) throw new ApiError(401, 'Invalid refresh token')

    return generateTokens(user)
  } catch (err) {
    throw new ApiError(401, 'Invalid refresh token')
  }
}

/* -------------------- CRUD -------------------- */

exports.createAppUser = async ({ schoolId, payload, userId }) => {
  const query = { schoolId, $or: [] }
  if (payload.email) query.$or.push({ email: payload.email.toLowerCase() })
  if (payload.phone) query.$or.push({ phone: payload.phone })

  if (query.$or.length > 0) {
    const existing = await AppUser.findOne(query)
    if (existing) {
      if (payload.email && existing.email === payload.email.toLowerCase()) {
        throw new ApiError(409, 'User with email already exists')
      }
      if (payload.phone && existing.phone === payload.phone) {
        throw new ApiError(409, 'User with phone already exists')
      }
    }
  }

  const hashed = await bcrypt.hash(payload.password, 10)

  const doc = await AppUser.create({
    name: payload.name,
    email: payload.email ? payload.email.toLowerCase() : undefined,
    phone: payload.phone,
    password: hashed,
    roleIds: payload.roleIds || [],
    teacherId: payload.teacherId,
    permissions: payload.permissions || [],
    schoolId,
    createdById: userId,
  })

  return doc.toJSON()
}

exports.listAppUsers = async ({ schoolId }) => {
  return await AppUser.find({ schoolId })
    .select('-password')
    .populate('roleIds', 'name')
    .populate({
      path: 'teacherId',
      select: 'firstNameEn lastNameEn roleIds',
      populate: {
        path: 'roleIds',
        model: 'StaffRole',
        select: 'nameEn nameSi'
      }
    })
    .sort({ name: 1 })
}

exports.getAppUser = async ({ schoolId, id }) => {
  const user = await AppUser.findOne({ _id: id, schoolId })
    .select('-password')
    .populate('roleIds', 'name')
    .populate({
      path: 'teacherId',
      select: 'firstNameEn lastNameEn roleIds',
      populate: {
        path: 'roleIds',
        select: 'name'
      }
    })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

exports.updateAppUser = async ({ schoolId, id, payload, userId }) => {
  const update = { ...payload }

  if (payload.email) update.email = payload.email.toLowerCase()
  if (payload.password) {
    update.password = await bcrypt.hash(payload.password, 10)
  }

  const updated = await AppUser.findOneAndUpdate(
    { _id: id, schoolId },
    { ...update, updatedById: userId },
    { new: true }
  ).select('-password')

  if (!updated) throw new ApiError(404, 'User not found')

  return updated.toJSON()
}



exports.deleteAppUser = async ({ schoolId, id }) => {
  const deleted = await AppUser.findOneAndDelete({ _id: id, schoolId })
  if (!deleted) throw new ApiError(404, 'User not found')
  return true
}

exports.resetPassword = async ({ id, newPassword }) => {
  const hashed = await bcrypt.hash(newPassword, 10)
  const updated = await AppUser.findByIdAndUpdate(
    id,
    { 
      password: hashed,
      isFirstTimeLogin: false 
    },
    { new: true }
  )
  if (!updated) throw new ApiError(404, 'User not found')
  return true
}
