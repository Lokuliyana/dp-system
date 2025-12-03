const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

const pastRoleSchema = z.object({
  roleId: objectId,
  fromYear: z.number().int().min(2000),
  toYear: z.number().int().min(2000).optional(),
})

exports.createTeacherSchema = z.object({
  body: z.object({
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),

    firstNameEn: z.string().min(1),
    lastNameEn: z.string().min(1),

    email: z.string().email().optional(),
    phone: z.string().optional(),

    dob: z.string().datetime().optional(),
    dateJoined: z.string().datetime(),

    roleIds: z.array(objectId).optional(),
    pastRoles: z.array(pastRoleSchema).optional(),

    qualifications: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
})

exports.updateTeacherSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),

    firstNameEn: z.string().optional(),
    lastNameEn: z.string().optional(),

    email: z.string().email().optional(),
    phone: z.string().optional(),

    dob: z.string().datetime().optional(),
    dateJoined: z.string().datetime().optional(),

    roleIds: z.array(objectId).optional(),
    qualifications: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
})

exports.deleteTeacherSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.appendPastRoleSchema = z.object({
  params: z.object({ id: objectId }),
  body: pastRoleSchema,
})

exports.listTeachersSchema = z.object({
  query: z.object({
    status: z.enum(['active', 'inactive']).optional(),
    roleId: objectId.optional(),
    search: z.string().optional(),
  }),
})
