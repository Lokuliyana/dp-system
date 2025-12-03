const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.linkParentStudentSchema = z.object({
  body: z.object({
    parentId: objectId,
    studentId: objectId,
    relationshipSi: z.string().optional(),
    relationshipEn: z.string().optional(),
    isPrimary: z.boolean().optional(),
  }),
})

exports.updateParentStudentLinkSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    relationshipSi: z.string().optional(),
    relationshipEn: z.string().optional(),
    isPrimary: z.boolean().optional(),
  }),
})

exports.unlinkParentStudentSchema = z.object({
  params: z.object({ id: objectId }),
})
