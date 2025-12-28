const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

const baseBody = z.object({
  competitionId: objectId,
  year: z.number().int().min(2000),

  type: z.enum(['house', 'independent']),
  houseId: objectId.optional(), // required if house
  gradeId: objectId.optional(),

  teamNameSi: z.string().optional(),
  teamNameEn: z.string().optional(),

  memberStudentIds: z.array(objectId).min(1, 'At least one member required'),
})

function typeRules(data, ctx) {
  if (data.type === 'house' && !data.houseId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'houseId is required when type = house',
      path: ['houseId'],
    })
  }
  if (data.type === 'independent' && data.houseId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'houseId must be empty when type = independent',
      path: ['houseId'],
    })
  }
}

exports.createTeamSchema = z.object({
  body: baseBody.superRefine(typeRules),
})

exports.updateTeamMembersSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      teamNameSi: z.string().optional(),
      teamNameEn: z.string().optional(),
      memberStudentIds: z.array(objectId).min(1).optional(),
      gradeId: objectId.optional(),
      houseId: objectId.optional(),
      type: z.enum(['house', 'independent']).optional(),
      year: z.number().int().min(2000).optional(),
      competitionId: objectId.optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type) typeRules(data, ctx)
    }),
})

exports.deleteTeamSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.listTeamsSchema = z.object({
  query: z.object({
    competitionId: objectId.optional(),
    year: z.string().optional(),
    type: z.enum(['house', 'independent']).optional(),
    houseId: objectId.optional(),
    gradeId: objectId.optional(),
  }),
})
