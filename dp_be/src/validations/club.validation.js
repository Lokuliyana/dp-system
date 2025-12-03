const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createClubSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1),
    nameEn: z.string().min(1),

    descriptionSi: z.string().optional(),
    descriptionEn: z.string().optional(),

    teacherInChargeId: objectId,
    year: z.number().int().min(2000),
  }),
})

exports.updateClubSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().optional(),
    nameEn: z.string().optional(),
    descriptionSi: z.string().optional(),
    descriptionEn: z.string().optional(),
    teacherInChargeId: objectId.optional(),
    year: z.number().int().min(2000).optional(),
  }),
})

exports.deleteClubSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.assignPositionSchema = z.object({
  params: z.object({
    id: objectId, // clubId
  }),
  body: z.object({
    studentId: objectId,
    positionId: objectId.optional(), // null => remove position
  }),
})
