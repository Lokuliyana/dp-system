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
    roleId: appUser.roleId,
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

exports.login = async ({ email, password }) => {
  const user = await AppUser.findOne({ email }).lean()
  if (!user) throw new ApiError(401, 'Invalid email or password')

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw new ApiError(401, 'Invalid email or password')

  const tokens = generateTokens(user)
  return { user, ...tokens }
}

exports.refresh = async ({ token }) => {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret)
    const user = await AppUser.findById(decoded.id).lean()
    if (!user) throw new ApiError(401, 'Invalid refresh token')

    return generateTokens(user)
  } catch (err) {
    throw new ApiError(401, 'Invalid refresh token')
  }
}

/* -------------------- CRUD -------------------- */

exports.createAppUser = async ({ schoolId, payload, userId }) => {
  const existing = await AppUser.findOne({
    schoolId,
    email: payload.email.toLowerCase(),
  })

  if (existing) throw new ApiError(409, 'User with email already exists')

  const hashed = await bcrypt.hash(payload.password, 10)

  const doc = await AppUser.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: hashed,
    roleId: payload.roleId,
    permissions: payload.permissions || [],
    schoolId,
    createdById: userId,
  })

  return doc.toJSON()
}

exports.listAppUsers = async ({ schoolId }) => {
  return await AppUser.find({ schoolId })
    .select('-password')
    .sort({ name: 1 })
    .lean()
}

exports.updateAppUser = async ({ schoolId, id, payload, userId }) => {
  const update = { ...payload }

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
