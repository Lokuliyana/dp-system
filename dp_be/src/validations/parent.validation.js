const { z } = require('zod')

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/)

exports.createParentSchema = z.object({
  body: z.object({
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),

    firstNameEn: z.string().min(1),
    lastNameEn: z.string().min(1),

    occupationSi: z.string().optional(),
    occupationEn: z.string().optional(),

    email: z.string().email().optional(),
    phoneNum: z.string().optional(),

    addressSi: z.string().optional(),
    addressEn: z.string().optional(),
  }),
})

exports.updateParentSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    firstNameSi: z.string().optional(),
    lastNameSi: z.string().optional(),
    firstNameEn: z.string().optional(),
    lastNameEn: z.string().optional(),

    occupationSi: z.string().optional(),
    occupationEn: z.string().optional(),

    email: z.string().email().optional(),
    phoneNum: z.string().optional(),

    addressSi: z.string().optional(),
    addressEn: z.string().optional(),
  }),
})

exports.deleteParentSchema = z.object({
  params: z.object({ id: objectId }),
})

exports.listParentsSchema = z.object({
  query: z.object({
    q: z.string().optional(), // name/phone/email search
  }),
})
