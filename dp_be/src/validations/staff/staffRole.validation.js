const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

const responsibilitySchema = z.object({
  level: z.union([z.literal(1), z.literal(2)]),
  textSi: z.string().min(1),
  textEn: z.string().min(1),
})

exports.createStaffRoleSchema = z.object({
  body: z.object({
    nameSi: z.string().min(1),
    nameEn: z.string().min(1),
    gradeBased: z.boolean().optional(),
    singleGraded: z.boolean().optional(),
    gradesEffected: z.array(objectId).optional(),
    responsibilities: z.array(responsibilitySchema).optional(),
    descriptionSi: z.string().optional(),
    descriptionEn: z.string().optional(),
    teacherIds: z.array(objectId).optional(),
    order: z.number().int().optional(),
  }).refine(
    (data) => {
      if (data.gradeBased) return Array.isArray(data.gradesEffected) && data.gradesEffected.length > 0
      return true
    },
    { message: 'gradesEffected required when gradeBased is true', path: ['gradesEffected'] }
  ),
})

exports.updateStaffRoleSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    nameSi: z.string().optional(),
    nameEn: z.string().optional(),
    gradeBased: z.boolean().optional(),
    singleGraded: z.boolean().optional(),
    gradesEffected: z.array(objectId).optional(),
    responsibilities: z.array(responsibilitySchema).optional(),
    descriptionSi: z.string().optional(),
    descriptionEn: z.string().optional(),
    teacherIds: z.array(objectId).optional(),
    order: z.number().int().optional(),
  }).refine(
    (data) => {
      if (data.gradeBased === undefined) return true
      if (data.gradeBased) return Array.isArray(data.gradesEffected) && data.gradesEffected.length > 0
      return true
    },
    { message: 'gradesEffected required when gradeBased is true', path: ['gradesEffected'] }
  ),
})

exports.deleteStaffRoleSchema = z.object({
  params: z.object({ id: objectId }),
})
