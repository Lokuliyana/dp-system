const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

const resultEntrySchema = z
  .object({
    place: z.number().int().min(0).max(5),

    studentId: objectId.optional(),
    teamId: objectId.optional(),

    houseId: objectId.optional(),
    gradeId: objectId.optional(),

    personalAwardWinners: z.array(
      z.object({
        awardName: z.string(),
        studentId: objectId,
        houseId: objectId.optional(),
      })
    ).optional(),
  })
  .superRefine((data, ctx) => {
    // If place is 0 (personal awards), we don't need studentId/teamId/houseId on the root
    if (data.place === 0) return

    // For regular places (1-5):
    // It can be a student (individual), a team (team), or a house (team competition house place)
    const hasStudent = !!data.studentId
    const hasTeam = !!data.teamId
    const hasHouse = !!data.houseId

    if (!hasStudent && !hasTeam && !hasHouse) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide at least one of studentId, teamId, or houseId',
        path: ['studentId'],
      })
    }
  })

exports.recordResultsSchema = z.object({
  body: z.object({
    competitionId: objectId,
    year: z.number().int().min(2000),
    results: z.array(resultEntrySchema).min(1),
  }),
})

exports.listResultsSchema = z.object({
  query: z.object({
    competitionId: objectId.optional(),
    year: z.string().optional(),
    place: z.string().optional(),
    gradeId: objectId.optional(),
    houseId: objectId.optional(),
  }),
})

exports.removeResultSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.computeHousePointsSchema = z.object({
  query: z.object({
    year: z.string(),
  }),
})
