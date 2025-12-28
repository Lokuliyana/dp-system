const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.assignStudentHouseSchema = z.object({
  body: z.object({
    studentId: objectId,
    houseId: objectId,
    gradeId: objectId,
    year: z.number().int().min(2000),
    assignedDate: z.coerce.date().optional(),
  }),
})

exports.listHouseAssignmentsSchema = z.object({
  query: z.object({
    year: z.string().optional(),
    gradeId: objectId.optional(),
    houseId: objectId.optional(),
    studentId: objectId.optional(),
  }),
})
