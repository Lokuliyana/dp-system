const z = require('zod')

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  singleGraded: z.boolean().default(false),
})

const updateRoleSchema = createRoleSchema.partial()

const deleteRoleSchema = z.object({})

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  deleteRoleSchema,
}
