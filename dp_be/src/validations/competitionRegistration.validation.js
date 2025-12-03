const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

exports.registerSchema = z.object({
  body: z.object({
    competitionId: objectId,
    studentId: objectId,
    gradeId: objectId,

    mode: z.enum(['house', 'independent']),
    houseId: objectId.nullable().optional(), // must be null in independent mode

    year: z.number().int().min(2000),
  }),
})

exports.listSchema = z.object({
  query: z.object({
    competitionId: objectId.optional(),
    year: z.string().optional(),
    mode: z.enum(['house', 'independent']).optional(),
    gradeId: objectId.optional(),
    houseId: objectId.optional(),
  }),
})

exports.deleteSchema = z.object({
  params: z.object({
    id: objectId,
  }),
})
