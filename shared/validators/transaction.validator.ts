import validator from '#shared/services/validator.service.ts'

export const create = validator.create(v => v.object({
    description: v.optional(v.nullable(v.string()), ''),
    debit_account_id: v.pipe(v.number(), v.integer()),
    credit_account_id: v.pipe(v.number(), v.integer()),
    amount: v.pipe(v.number(), v.integer(), v.minValue(1))
}))

export const update = validator.create(v => v.partial(create))