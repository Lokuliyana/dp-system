const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

const bandSchema = z.object({
  label: z.string().min(1),
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  color: z.string().optional(),
  order: z.number().int().min(1),
})

exports.createGradingSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    bands: z.array(bandSchema).min(1),
  }),
})

exports.updateGradingSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().optional(),
    bands: z.array(bandSchema).optional(),
  }),
})

exports.deleteGradingSchema = z.object({
  params: z.object({ id: objectId }),
})
