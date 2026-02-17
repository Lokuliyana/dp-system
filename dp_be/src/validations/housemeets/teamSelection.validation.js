const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)
const levelEnum = z.enum(['zonal', 'district', 'allisland'])

const entrySchema = z.object({
  competitionId: objectId,
  studentId: objectId,
  place: z.number().int().min(1).max(5).optional(),
})

exports.saveSelectionSchema = z.object({
  body: z.object({
    level: levelEnum,
    year: z.number().int().min(2000),

    entries: z.array(entrySchema).optional(),
    teamPosition: z.number().int().optional(), // admin may set after results come
  }),
})

exports.getSelectionSchema = z.object({
  query: z.object({
    level: levelEnum,
    year: z.string(),
  }),
})

exports.getSuggestionsSchema = z.object({
  query: z.object({
    year: z.string(),
    level: levelEnum.optional(),
  }),
})


exports.autoGenerateSchema = z.object({
  body: z.object({
    fromLevel: levelEnum,
    toLevel: levelEnum,
    year: z.number().int().min(2000),
  }),
})
