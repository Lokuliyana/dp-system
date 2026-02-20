const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createExam = z.object({
  body: z.object({
    nameSi: z.string().min(1),
    nameEn: z.string().min(1),
    date: z.string().or(z.date()),
    type: z.enum(['SRIANANDA', 'DEPARTMENT']),
    gradeIds: z.array(objectId).min(1),
    year: z.number().int().min(2000),
  }),
})

exports.getExams = z.object({
  query: z.object({
    year: z.string().optional(),
    gradeId: objectId.optional(),
  }),
})

exports.getExamMarksOrStudents = z.object({
  params: z.object({
    examId: objectId,
  }),
  query: z.object({
    gradeId: objectId,
  }),
})

exports.updateMarks = z.object({
  params: z.object({
    examId: objectId,
  }),
  body: z.object({
    marks: z.array(z.object({
      studentId: objectId,
      gradeId: objectId,
      mark: z.number().min(0).optional(),
      isPresent: z.boolean().optional(),
      comment: z.string().optional(),
    })).min(1),
  }),
})

exports.getStudentExamHistory = z.object({
  params: z.object({
    studentId: objectId,
  }),
})
