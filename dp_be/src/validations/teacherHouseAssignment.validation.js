const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.assignTeacherHouseSchema = z.object({
  body: z.object({
    teacherId: objectId,
    houseId: objectId,
    assignedDate: z.coerce.date().optional(),
  }),
})

exports.listTeacherHouseAssignmentsSchema = z.object({
  query: z.object({
    houseId: objectId.optional(),
    teacherId: objectId.optional(),
  }),
})
