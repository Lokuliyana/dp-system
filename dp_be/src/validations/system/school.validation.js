const { z } = require('zod')

exports.updateSchoolConfigSchema = z.object({
  body: z.object({
    allowedDayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
  }),
})
