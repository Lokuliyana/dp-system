const { z } = require('zod')

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

exports.upsertHouseRuleSchema = z.object({
  body: z.object({
    competitionId: objectId,
    year: z.number().int().min(2000),

    maxPerHousePerGrade: z.number().int().min(1).optional(),
    maxTotalPerGrade: z.number().int().min(1).optional(),

    noteSi: z.string().optional(),
    noteEn: z.string().optional(),
  }),
})

exports.getHouseRuleSchema = z.object({
  query: z.object({
    competitionId: objectId,
    year: z.string(), // from querystring
  }),
})
