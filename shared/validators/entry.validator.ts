import validator from '#shared/services/validator.service.ts'

export const create = validator.create(v => v.object({
    transaction_id: v.pipe(v.number(), v.integer()),
    account_id: v.pipe(v.number(), v.integer()),
    type: v.picklist(['debit', 'credit']),
    amount: v.pipe(v.number(), v.integer(), v.minValue(1))
}))

export const update = validator.create(v => v.object({
    transaction_id: v.optional(v.pipe(v.number(), v.integer())),
    account_id: v.optional(v.pipe(v.number(), v.integer())),
    type: v.optional(v.picklist(['debit', 'credit'])),
    amount: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)))
}))