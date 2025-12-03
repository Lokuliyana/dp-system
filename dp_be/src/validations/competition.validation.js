const { z } = require('zod')

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

const scopeEnum = z.enum(['open', 'grade', 'section'])

function scopeRules(data, ctx) {
  if (data.scope === 'grade' && (!data.gradeIds || data.gradeIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'gradeIds required when scope = grade',
      path: ['gradeIds'],
    })
  }
  if (data.scope === 'section' && (!data.sectionIds || data.sectionIds.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'sectionIds required when scope = section',
      path: ['sectionIds'],
    })
  }
  if (data.scope === 'open') {
    if (data.gradeIds?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'gradeIds must be empty when scope = open',
        path: ['gradeIds'],
      })
    }
    if (data.sectionIds?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sectionIds must be empty when scope = open',
        path: ['sectionIds'],
      })
    }
  }
}

exports.createCompetitionSchema = z.object({
  body: z
    .object({
      nameSi: z.string(),
      nameEn: z.string(),
      squadId: objectId.optional(),
      scope: scopeEnum,
      gradeIds: z.array(objectId).optional(),
      sectionIds: z.array(objectId).optional(),
      isMainCompetition: z.boolean().optional(),
      active: z.boolean().optional(),
      year: z.number().int().optional(),
      participationType: z.enum(['individual', 'team']).optional(),
      teamConfig: z
        .object({
          minSize: z.number().int().min(1).optional(),
          maxSize: z.number().int().min(1).optional(),
        })
        .optional(),
      pointsConfig: z
        .object({
          place1: z.number().int().min(0).optional(),
          place2: z.number().int().min(0).optional(),
          place3: z.number().int().min(0).optional(),
          place4: z.number().int().min(0).optional(),
          place5: z.number().int().min(0).optional(),
        })
        .optional(),
    })
    .superRefine(scopeRules),
})

exports.updateCompetitionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      nameSi: z.string().min(1).optional(),
      nameEn: z.string().min(1).optional(),

      squadId: objectId.optional(),

      scope: scopeEnum.optional(),
      gradeIds: z.array(objectId).optional(),
      sectionIds: z.array(objectId).optional(),

      isMainCompetition: z.boolean().optional(),
      year: z.number().int().min(2000).optional(),
    })
    .superRefine((data, ctx) => {
      // only enforce scope rules if scope is provided in update
      if (data.scope) scopeRules(data, ctx)
    }),
})

exports.deleteCompetitionSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.listCompetitionsSchema = z.object({
  query: z.object({
    squadId: objectId.optional(),
    year: z.string().optional(),
    scope: scopeEnum.optional(),
    isMainCompetition: z.string().optional(), // "true"/"false"
  }),
})
