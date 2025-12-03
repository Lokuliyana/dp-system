const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

const emergencyContactZ = z.object({
  nameSi: z.string().optional(),
  nameEn: z.string().optional(),
  relationshipSi: z.string().optional(),
  relationshipEn: z.string().optional(),
  number: z.string().optional(),
})

exports.createStudentSchema = z.object({
  body: z.object({
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),

    firstNameEn: z.string().min(1),
    lastNameEn: z.string().min(1),

    admissionNumber: z.string().min(1),
    admissionDate: z.coerce.date(),
    dob: z.coerce.date(),

    gradeId: objectId,
    sectionId: objectId.or(z.literal('')).optional().transform(v => v === '' ? undefined : v),

    email: z.string().email().or(z.literal('')).optional().transform(v => v === '' ? undefined : v),
    phoneNum: z.string().optional(),
    addressSi: z.string().optional(),
    addressEn: z.string().optional(),

    emergencyContacts: z.array(emergencyContactZ).optional(),

    academicYear: z.number().int().min(2000).optional(),
  }),
})

exports.listStudentsByGradeSchema = z.object({
  query: z.object({
    gradeId: objectId,
    academicYear: z.string().optional(),
  }),
})

exports.updateStudentBasicInfoSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),
    firstNameEn: z.string().optional(),
    lastNameEn: z.string().optional(),

    admissionNumber: z.string().optional(),
    admissionDate: z.coerce.date().optional(),
    dob: z.coerce.date().optional(),

    gradeId: objectId.optional(),
    sectionId: objectId.optional(),

    email: z.string().email().optional(),
    phoneNum: z.string().optional(),
    addressSi: z.string().optional(),
    addressEn: z.string().optional(),

    emergencyContacts: z.array(emergencyContactZ).optional(),

    academicYear: z.number().int().min(2000).optional(),
  }),
})

exports.deleteStudentSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.addStudentNoteSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    category: z.enum(['academic', 'behaviour', 'achievement', 'health', 'other']).optional(),
    content: z.string().min(1),
  }),
})

exports.removeStudentNoteSchema = z.object({
  params: z.object({
    id: objectId,
    noteId: objectId,
  }),
})

exports.getStudent360Schema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({
    year: z.string().optional(),
  }),
})
