const { z } = require('zod')
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createAppUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    roleId: objectId,
    permissions: z.array(z.string()).optional(),
  }),
})

exports.updateAppUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    roleId: objectId.optional(),
    isActive: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
  }),
})

exports.deleteAppUserSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
})
