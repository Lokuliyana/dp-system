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
    // --- Names ---
    firstNameSi: z.string().min(1),
    lastNameSi: z.string().min(1),
    fullNameSi: z.string().min(1),
    nameWithInitialsSi: z.string().min(1),

    firstNameEn: z.string().optional(),
    lastNameEn: z.string().optional(),
    fullNameEn: z.string().min(1),

    // --- Personal ---
    admissionNumber: z.string().min(1),
    admissionDate: z.coerce.date(),
    dob: z.coerce.date(),
    sex: z.enum(['male', 'female']),
    birthCertificateNumber: z.string().optional(),

    // --- Academic ---
    gradeId: objectId.optional(),
    sectionId: objectId.or(z.literal('')).optional().transform(v => v === '' ? undefined : v),
    admittedGrade: z.string().optional(),
    medium: z.enum(['sinhala', 'english', 'tamil']).optional(),
    academicYear: z.number().int().min(2000).optional(),

    // --- Contact ---
    email: z.string().email().or(z.literal('')).optional().transform(v => v === '' ? undefined : v),
    phoneNum: z.string().optional(),
    whatsappNumber: z.string().optional(),
    emergencyNumber: z.string().optional(),
    addressSi: z.string().optional(),
    addressEn: z.string().optional(),

    // --- Parents ---
    motherNameEn: z.string().optional(),
    motherNumber: z.string().optional(),
    motherOccupation: z.string().optional(),
    fatherNameEn: z.string().optional(),
    fatherNumber: z.string().optional(),
    fatherOccupation: z.string().optional(),

    // --- Legacy ---
    emergencyContacts: z.array(emergencyContactZ).optional(),
  }),
})

exports.listStudentsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    gradeId: objectId.optional(),
    sectionId: objectId.optional(),
    academicYear: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    birthYear: z.string().regex(/^\d{4}$/).optional(),
    admittedYear: z.string().regex(/^\d{4}$/).optional(),
    status: z.enum(['active', 'inactive', 'all']).optional(),
  }),
})

exports.listStudentsByGradeSchema = z.object({
  query: z.object({
    gradeId: objectId,
    academicYear: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    status: z.enum(['active', 'inactive', 'all']).optional(),
  }),
})

exports.listStudentsWithResultsByGradeSchema = z.object({
  query: z.object({
    gradeId: objectId,
    academicYear: z.string().optional(),
    sex: z.enum(['male', 'female']).optional(),
    status: z.enum(['active', 'inactive', 'all']).optional(),
  }),
})

exports.updateStudentBasicInfoSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    // --- Names ---
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),
    fullNameSi: z.string().optional(),
    nameWithInitialsSi: z.string().optional(),
    firstNameEn: z.string().optional(),
    lastNameEn: z.string().optional(),
    fullNameEn: z.string().optional(),

    // --- Personal ---
    admissionNumber: z.string().optional(),
    admissionDate: z.coerce.date().optional(),
    dob: z.coerce.date().optional(),
    sex: z.enum(['male', 'female']).optional(),
    birthCertificateNumber: z.string().optional(),

    // --- Academic ---
    gradeId: objectId.optional(),
    sectionId: objectId.optional(),
    admittedGrade: z.string().optional(),
    medium: z.enum(['sinhala', 'english', 'tamil']).optional(),
    academicYear: z.number().int().min(2000).optional(),
    admissionYear: z.number().int().min(2000).optional(),

    // --- Contact ---
    email: z.string().email().or(z.literal('')).optional().transform(v => v === '' ? undefined : v),
    phoneNum: z.string().optional(),
    whatsappNumber: z.string().optional(),
    emergencyNumber: z.string().optional(),
    addressSi: z.string().optional(),
    addressEn: z.string().optional(),

    // --- Parents ---
    motherNameEn: z.string().optional(),
    motherNumber: z.string().optional(),
    motherOccupation: z.string().optional(),
    fatherNameEn: z.string().optional(),
    fatherNumber: z.string().optional(),
    fatherOccupation: z.string().optional(),

    // --- Status & Others ---
    status: z.enum(['active', 'inactive']).optional(),
    activeNote: z.string().optional(),
    inactiveNote: z.string().optional(),
    present: z.boolean().optional(),
    birthYear: z.number().int().optional(),

    emergencyContacts: z.array(emergencyContactZ).optional(),
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
