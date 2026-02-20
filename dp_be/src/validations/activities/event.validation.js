const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createEventSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1),
    nameEn: z.string().min(1),
    descriptionSi: z.string().optional(),
    descriptionEn: z.string().optional(),
    eventType: z.string().optional(),
    date: z.coerce.date(),
    gradeIds: z.array(objectId).optional(),
    teacherInChargeId: objectId,
    year: z.number().int().min(2000),
    clubId: objectId.optional(),
    squadId: objectId.optional(),
  }),
})

exports.updateEventSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().optional(),
    nameEn: z.string().optional(),
    descriptionSi: z.string().optional(),
    descriptionEn: z.string().optional(),
    eventType: z.string().optional(),
    date: z.coerce.date().optional(),
    gradeIds: z.array(objectId).optional(),
    teacherInChargeId: objectId.optional(),
    year: z.number().int().min(2000).optional(),
    clubId: objectId.optional(),
    squadId: objectId.optional(),
  }),
})

exports.deleteEventSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.registerStudentForEventSchema = z.object({
  body: z.object({
    eventId: objectId,
    studentId: objectId,
    year: z.number().int().min(2000),
  }),
})

exports.listEventRegistrationsSchema = z.object({
  query: z.object({
    eventId: objectId.optional(),
    studentId: objectId.optional(),
    year: z.string().optional(),
  }),
})
