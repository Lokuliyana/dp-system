const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.markAttendanceSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    studentId: objectId,
    gradeId: objectId,
    status: z.enum(['present', 'absent', 'late']),
  }),
})

exports.updateAttendanceSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(['present', 'absent', 'late']),
  }),
})

exports.listAttendanceByDateSchema = z.object({
  query: z.object({
    date: z.string().min(1),
    gradeId: objectId.optional(),
  }),
})

exports.listAttendanceByStudentSchema = z.object({
  params: z.object({ studentId: objectId }),
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
})

exports.deleteAttendanceSchema = z.object({
  params: z.object({ id: objectId }),
})
