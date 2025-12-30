const { z } = require('zod')
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createAppUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6),
    roleIds: z.array(objectId).optional(),
    teacherId: objectId.optional(),
    permissions: z.array(z.string()).optional(),
  }).refine(data => data.email || data.phone, {
    message: "Either email or phone must be provided",
    path: ["email"],
  }),
})

exports.updateAppUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6).optional(),
    roleIds: z.array(objectId).optional(),
    teacherId: objectId.optional(),
    isActive: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
  }),
})


exports.deleteAppUserSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1),
    password: z.string().min(1),
  }),
})

