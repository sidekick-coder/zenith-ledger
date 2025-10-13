import validator from '#shared/services/validator.service.ts'

export const create = validator.create(v => v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
    type: v.picklist(['debit', 'credit']),
    description: v.optional(v.nullable(v.string())),
    parent_id: v.optional(v.nullable(v.pipe(v.number(), v.integer())))
}))

export const update = validator.create(v => v.partial(create))