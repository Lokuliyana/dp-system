const { z } = require('zod')

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

exports.createSectionSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1, 'nameSi is required'),
    nameEn: z.string().min(1, 'nameEn is required'),
    assignedGradeIds: z.array(objectId).optional()
  })
})

exports.updateSectionSchema = z.object({
  params: z.object({
    id: objectId
  }),
  body: z.object({
    nameSi: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
    assignedGradeIds: z.array(objectId).optional()
  })
})

exports.deleteSectionSchema = z.object({
  params: z.object({
    id: objectId
  })
})
