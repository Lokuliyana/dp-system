const { z } = require('zod')

exports.triggerPromotionSchema = z.object({
  body: z.object({
    fromYear: z.number().int().min(2000),
    toYear: z.number().int().min(2000),
    dryRun: z.boolean().optional(), // if true, do not write, just return counts
  }),
})
