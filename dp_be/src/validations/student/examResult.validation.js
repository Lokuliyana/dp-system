const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

const perStudentResult = z.object({
  studentId: objectId,
  mark: z.number().min(0),
  gradingSchemaId: objectId,
})

exports.createExamResultSheet = z.object({
  body: z.object({
    year: z.number().int().min(2000),
    term: z.number().int().min(1).max(3),
    gradeId: objectId,
  }),
})

exports.upsertExamResults = z.object({
  body: z.object({
    year: z.number().int().min(2000),
    term: z.number().int().min(1).max(3),
    gradeId: objectId,
    results: z.array(perStudentResult).min(1),
  }),
})

exports.listByStudent = z.object({
  params: z.object({
    studentId: objectId,
  }),
  query: z.object({
    year: z.string().optional(),
    term: z.string().optional(),
  }).optional(),
})

exports.listByGrade = z.object({
  params: z.object({
    gradeId: objectId,
  }),
  query: z.object({
    year: z.string().optional(),
    term: z.string().optional(),
  }).optional(),
})
