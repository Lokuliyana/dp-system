const { z } = require('zod')

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

exports.createSquadSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1),
    nameEn: z.string().min(1),
    icon: z.string().optional(),
    assignedGradeIds: z.array(objectId).optional(),
    assignedSectionIds: z.array(objectId).optional()
  })
})

exports.updateSquadSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
    icon: z.string().optional(),
    assignedGradeIds: z.array(objectId).optional(),
    assignedSectionIds: z.array(objectId).optional()
  })
})

exports.deleteSquadSchema = z.object({
  params: z.object({ id: objectId })
})
