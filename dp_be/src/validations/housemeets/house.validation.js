const { z } = require('zod')

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

exports.createHouseSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1, 'nameSi is required'),
    nameEn: z.string().min(1, 'nameEn is required'),
    color: z.string().min(1, 'color is required'),
    mottoSi: z.string().optional(),
    mottoEn: z.string().optional(),
  }),
})

exports.updateHouseSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    mottoSi: z.string().optional(),
    mottoEn: z.string().optional(),
  }),
})

exports.deleteHouseSchema = z.object({
  params: z.object({ id: objectId }),
})
