import validator from '#shared/services/validator.service.ts'

export const create = validator.create(v => v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
    type: v.picklist(['asset', 'liability', 'equity', 'income', 'expense']),
    description: v.optional(v.nullable(v.string())),
    parent_id: v.optional(v.nullable(v.pipe(v.number(), v.integer())))
}))

export const update = validator.create(v => v.object({
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
    type: v.optional(v.picklist(['asset', 'liability', 'equity', 'income', 'expense'])),
    description: v.optional(v.nullable(v.string())),
    parent_id: v.optional(v.nullable(v.pipe(v.number(), v.integer())))
}))