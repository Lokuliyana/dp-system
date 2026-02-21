const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)
const rankEnum = z.enum([
  'head-prefect',
  'deputy-head-prefect',
  'senior-prefect',
  'junior-prefect',
  'primary-prefect',
])

exports.createPrefectYearSchema = z.object({
  body: z.object({
    year: z.number().int().min(2000),
    appointedDate: z.coerce.date().optional(),
  }),
})

exports.addPrefectStudentSchema = z.object({
  params: z.object({ id: objectId }), // prefect year doc id
  body: z.object({
    studentId: objectId,
    studentNameSi: z.string().optional(),
    studentNameEn: z.string().optional(),
    rank: rankEnum,
    positionIds: z.array(objectId).optional(),
  }),
})

exports.updatePrefectStudentSchema = z.object({
  params: z.object({
    id: objectId, // prefect year doc id
    studentId: objectId, // studentId inside list
  }),
  body: z.object({
    rank: rankEnum.optional(),
    positionIds: z.array(objectId).optional(),
    studentNameSi: z.string().optional(),
    studentNameEn: z.string().optional(),
  }),
})

exports.removePrefectStudentSchema = z.object({
  params: z.object({
    id: objectId,
    studentId: objectId,
  }),
})

exports.listPrefectsSchema = z.object({
  query: z.object({
    year: z.string().optional(),
  }),
})
