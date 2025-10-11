import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import * as schemas from '#ledger/shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import Entry from '#ledger/server/entities/entry.entity.ts'
import Account from '#ledger/server/entities/account.entity.ts'
import db from '#server/facades/db.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import { $t } from '#shared/lang.ts'

const router = rootRouter.prefix('/api/ledger/entries')
    .use(authMiddleware)
    .group()

router.get('/', async ({ query, acl }) => {
    acl.authorize('read', 'Entry')

    const payload = validator.validate(query, schemas.pagination.schema)

    const pagination = await Entry.paginate({
        page: payload.page,
        limit: payload.limit,
        query: () => db.selectFrom('ledger__entries as e')
            .selectAll('e')
            .where(undeleted.column('e.deleted_at'))
            .leftJoin('ledger__accounts as a', 'e.account_id', 'a.id')
            .leftJoin('ledger__transactions as t', 'e.transaction_id', 't.id')
            .select([
                'a.name as account_name',
                'a.type as account_type',
                't.description as transaction_description'
            ])
            .orderBy('created_at', 'desc')
    })

    return pagination
})

router.get('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const entry = await Entry.findOneOrFail({
        query: q => q.where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', entry)

    return entry
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'Entry')

    const payload = validator.validate(body, schemas.entry.create)

    // Validate account exists
    await Account.findOneOrFail({
        query: q => q.where('id', '=', payload.account_id)
            .where(undeleted)
            .select(['id'])
    })

    // Validate transaction exists
    const transaction = await db.selectFrom('ledger__transactions')
        .where('id', '=', payload.transaction_id)
        .where(undeleted.column('deleted_at'))
        .select(['id'])
        .executeTakeFirst()

    if (!transaction) {
        throw new BaseException($t('Transaction not found'))
    }

    const entry = await Entry.create({
        transaction_id: payload.transaction_id,
        account_id: payload.account_id,
        type: payload.type,
        amount: payload.amount
    })

    return entry
})

router.put('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(body, schemas.entry.update)

    const entry = await Entry.findOneOrFail({
        query: q => q
            .where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', entry)

    // Validate account exists if account_id is provided
    if (payload.account_id) {
        await Account.findOneOrFail({
            query: q => q.where('id', '=', payload.account_id!)
                .where(undeleted)
                .select(['id'])
        })
    }

    // Validate transaction exists if transaction_id is provided
    if (payload.transaction_id) {
        const transaction = await db.selectFrom('ledger__transactions')
            .where('id', '=', payload.transaction_id!)
            .where(undeleted.column('deleted_at'))
            .select(['id'])
            .executeTakeFirst()

        if (!transaction) {
            throw new BaseException($t('Transaction not found'))
        }
    }

    await Entry.updateById(entry.id, payload)

    entry.merge(payload)

    return entry
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    
    const entry = await Entry.findOneOrFail({
        query: q => q.where('id', '=', id).selectAll()
    })

    acl.authorize('delete', entry)

    await entry.softDelete()

    return entry
})

export default router
