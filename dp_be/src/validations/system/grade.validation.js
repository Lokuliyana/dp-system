const { z } = require('zod')

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')

const pastTeacherSchema = z.object({
  teacherId: objectId,
  fromYear: z.number().int().min(2000),
  toYear: z.number().int().min(2000).optional(),
})

exports.createGradeSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1, 'nameSi is required'),
    nameEn: z.string().min(1, 'nameEn is required'),
    level: z.number().int().min(1).max(14),
    classTeacherId: objectId.nullable().optional(),
  }),
})

exports.updateGradeSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().min(1).optional(),
    nameEn: z.string().min(1).optional(),
    level: z.number().int().min(1).max(14).optional(),

    classTeacherId: objectId.nullable().optional(),
    pastTeachers: z.array(pastTeacherSchema).optional(),
  }),
})

exports.deleteGradeSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.listGradesSchema = z.object({
  query: z.object({
    year: z.string().optional(),
  }),
})
