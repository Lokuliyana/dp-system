const jwt = require('jsonwebtoken')
const env = require('../config/env')
const ApiError = require('../utils/apiError')

const PUBLIC_PATHS = [`${env.apiPrefix}/app-users/login`, `${env.apiPrefix}/app-users/refresh`]

module.exports = async (req, _res, next) => {
  // Always ignore preflight
  if (req.method === 'OPTIONS') return next()

  // Skip auth for public endpoints
  if (PUBLIC_PATHS.includes(req.path)) {
    req.user = null
    return next()
  }

  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token required'))
  }

  const token = header.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret)
    
    // Fetch full user to get latest permissions
    const AppUser = require('../models/system/appUser.model')
    require('../models/system/role.model') // Ensure Role model is registered for populate
    const user = await AppUser.findById(decoded.id).populate('roleIds').lean()

    
    if (!user) {
      return next(new ApiError(401, 'User not found'))
    }

    if (!user.isActive) {
      return next(new ApiError(401, 'User is inactive'))
    }

    // Since we use lean(), we need to manually set .id if controllers rely on it
    user.id = user._id.toString()
    req.user = user

    // Handle system roles for restrictions and permissions
    let systemRoles = user.roleIds || []
    if (systemRoles.length === 0 && user.roleId) {
      const Role = require('../models/system/role.model')
      const r = await Role.findById(user.roleId).lean()
      if (r) systemRoles = [r]
    }

    // Aggregrate permissions
    const P = require('../constants/permissions')
    const basePermissions = new Set()
    
    // Default: Every user can read everything and mark attendance
    Object.values(P).forEach(group => {
      if (typeof group === 'object') {
        Object.values(group).forEach(perm => {
          if (perm.endsWith(':read') || perm === P.ATTENDANCE?.MARK) {
            basePermissions.add(perm)
          }
        })
      }
    })

    const finalPermissions = new Set([...basePermissions])
    
    // Add User's explicit permissions
    if (user.permissions) {
      user.permissions.forEach(p => finalPermissions.add(p))
    }

    // Add permissions from Roles
    systemRoles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(p => finalPermissions.add(p))
      }
    })

    req.user.permissions = Array.from(finalPermissions)
    // console.log(`[AUTH] User ${user.name} aggregate permissions: ${req.user.permissions.length}`)

  /* REMOVED: Grade restrictions based on singleGraded roles
    const isSystemRestricted = systemRoles.length > 0 && systemRoles.every(r => r.singleGraded)
    // console.log(`[AUTH] isSystemRestricted: ${isSystemRestricted}, teacherId: ${user.teacherId}`)

    if (isSystemRestricted && user.teacherId) {
      const Teacher = require('../models/staff/teacher.model')
      const Grade = require('../models/system/grade.model')
      const StaffRole = require('../models/staff/staffRole.model')

      const teacher = await Teacher.findById(user.teacherId).lean()
      // console.log(`[AUTH] Teacher found: ${!!teacher}`)
      if (teacher) {
        // Fetch StaffRoles
        const staffRoles = await StaffRole.find({ _id: { $in: teacher.roleIds || [] } }).lean()
        // console.log(`[AUTH] Staff roles found: ${staffRoles.length}`)
        
        // A user is restricted if they have no staff roles OR all their staff roles are singleGraded.
        const isStaffRestricted = staffRoles.every(sr => sr.singleGraded)
        // console.log(`[AUTH] isStaffRestricted: ${isStaffRestricted}`)


        if (isStaffRestricted) {
          const gradeIds = new Set()

          // 1. Grades from StaffRoles
          staffRoles.forEach(sr => {
            sr.gradesEffected?.forEach(gid => gradeIds.add(gid.toString()))
          })

          // 2. Grade where teacher is Class Teacher
          const classGrades = await Grade.find({ classTeacherId: teacher._id }).select('_id').lean()
          classGrades.forEach(g => gradeIds.add(g._id.toString()))

          const finalGradeIds = Array.from(gradeIds)
          req.user.restrictedGradeIds = finalGradeIds
          console.log(`[AUTH] User ${user.name} restricted to grades: ${finalGradeIds.join(', ')}`)


          // Sync to DB if changed (optional optimization, but helps with user's request)
          const currentStored = (user.restrictedGradeIds || []).map(id => id.toString()).sort()
          const newOnes = [...finalGradeIds].sort()
          
          if (JSON.stringify(currentStored) !== JSON.stringify(newOnes)) {
            AppUser.updateOne({ _id: user._id }, { $set: { restrictedGradeIds: finalGradeIds } }).exec()
          }
        } else {
          // If not restricted anymore, clear it
          if (user.restrictedGradeIds?.length > 0) {
            AppUser.updateOne({ _id: user._id }, { $unset: { restrictedGradeIds: 1 } }).exec()
          }
          req.user.restrictedGradeIds = undefined
        }
      }
    } else if (user.restrictedGradeIds?.length > 0) {
      // Not restricted by roles, but has stored grades? Clear them.
      AppUser.updateOne({ _id: user._id }, { $unset: { restrictedGradeIds: 1 } }).exec()
      req.user.restrictedGradeIds = undefined
    }
    */
    
    // Explicitly clear restrictedGradeIds so downstream services don't use it
    req.user.restrictedGradeIds = undefined




    return next()

  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'))
  }
}
