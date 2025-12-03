const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createClubPositionSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1),
    nameEn: z.string().min(1),
    responsibilitySi: z.string().optional(),
    responsibilityEn: z.string().optional(),
  }),
})

exports.updateClubPositionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().optional(),
    nameEn: z.string().optional(),
    responsibilitySi: z.string().optional(),
    responsibilityEn: z.string().optional(),
  }),
})

exports.deleteClubPositionSchema = z.object({
  params: z.object({ id: objectId }),
})
