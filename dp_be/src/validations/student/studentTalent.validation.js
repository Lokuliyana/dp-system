const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

const achievementZ = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  achievedAt: z.coerce.date().optional(),
})

exports.createStudentTalentSchema = z.object({
  body: z.object({
    studentId: objectId,
    talentName: z.string().min(1),
    description: z.string().optional(),
    year: z.number().int().min(2000),
    achievements: z.array(achievementZ).optional(),
  }),
})

exports.updateStudentTalentSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    talentName: z.string().optional(),
    description: z.string().optional(),
    achievements: z.array(achievementZ).optional(),
  }),
})

exports.deleteStudentTalentSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.listStudentTalentSchema = z.object({
  query: z.object({
    studentId: objectId.optional(),
    year: z.string().optional(),
  }),
})
