import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import * as schemas from '#ledger/shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import Transaction from '#ledger/server/entities/transaction.entity.ts'
import Account from '#ledger/server/entities/account.entity.ts'
import Entry from '#ledger/server/entities/entry.entity.ts'
import db from '#server/facades/db.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import { $t } from '#shared/lang.ts'

const router = rootRouter.prefix('/api/ledger/transactions')
    .use(authMiddleware)
    .group()

router.get('/', async ({ query, acl }) => {
    acl.authorize('read', 'Transaction')

    const payload = validator.validate(query, schemas.pagination.schema)

    const pagination = await Transaction.paginate({
        page: payload.page,
        limit: payload.limit,
        query: () => db.selectFrom('ledger__transactions as t')
            .selectAll('t')
            .leftJoin('ledger__entries as de', 
                j => j.onRef('de.transaction_id', '=', 't.id').on('de.type', '=', 'debit')
            )
            .leftJoin('ledger__entries as ce', 
                j => j.onRef('ce.transaction_id', '=', 't.id').on('ce.type', '=', 'credit')
            )
            .leftJoin('ledger__accounts as da', 'de.account_id', 'da.id')
            .leftJoin('ledger__accounts as ca', 'ce.account_id', 'ca.id')
            .select([
                'de.id as debit_id',
                'de.account_id as debit_account_id',
                'da.name as debit_account_name',
                'de.amount as debit_amount',
                'ce.id as credit_id',
                'ce.account_id as credit_account_id',
                'ca.name as credit_account_name',
                'ce.amount as credit_amount',
            ])
            .where(undeleted.column('t.deleted_at'))
            .orderBy('created_at', 'desc')
    })

    return pagination
})

router.get('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const transaction = await Transaction.findOneOrFail({
        query: q => q.where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', transaction)

    return transaction
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'Transaction')

    const payload = validator.validate(body, schemas.transaction.create)

    const debitAccount = await Account.findOrFail(payload.debit_account_id)
    const creditAccount = await Account.findOrFail(payload.credit_account_id)

    if (debitAccount.id === creditAccount.id) {
        throw new BaseException($t('Debit and credit accounts must be different'))
    }

    const transaction = await Transaction.create({
        description: payload.description
    })

    const entries = await Entry.createMany([
        {
            transaction_id: transaction.id,
            account_id: debitAccount.id,
            type: 'debit',
            amount: payload.amount
        },
        {
            transaction_id: transaction.id,
            account_id: creditAccount.id,
            type: 'credit',
            amount: payload.amount
        },
    ])

    transaction.entries = entries

    return transaction
})

router.put('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(body, schemas.transaction.update)

    const transaction = await Transaction.findOneOrFail({
        query: q => q
            .where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', transaction)

    await Transaction.updateById(transaction.id, payload)

    transaction.merge(payload)

    return transaction
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    
    const transaction = await Transaction.findOneOrFail({
        query: q => q.where('id', '=', id).selectAll()
    })

    acl.authorize('delete', transaction)

    // Check if transaction has entries
    const hasEntries = await db.selectFrom('ledger__entries')
        .where('transaction_id', '=', transaction.id)
        .where(undeleted.column('deleted_at'))
        .select(['id'])
        .executeTakeFirst()

    if (hasEntries) {
        throw new BaseException($t('Cannot delete transaction with existing entries'))
    }

    await transaction.softDelete()

    return transaction
})

// Get entries for a specific transaction
router.get('/:id/entries', async ({ params, query, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(query, schemas.pagination.schema)

    const transaction = await Transaction.findOneOrFail({
        query: q => q.where('id', '=', id)
            .where(undeleted)
            .select(['id'])
    })

    acl.authorize('read', transaction)

    const entries = await db.selectFrom('ledger__entries as e')
        .selectAll('e')
        .where('e.transaction_id', '=', transaction.id)
        .where(undeleted.column('e.deleted_at'))
        .leftJoin('ledger__accounts as a', 'e.account_id', 'a.id')
        .select([
            'a.name as account_name',
            'a.type as account_type'
        ])
        .orderBy('e.created_at', 'asc')
        .limit(payload.limit)
        .offset((payload.page - 1) * payload.limit)
        .execute()

    const total = await db.selectFrom('ledger__entries')
        .where('transaction_id', '=', transaction.id)
        .where(undeleted.column('deleted_at'))
        .select(db.fn.count('id').as('count'))
        .executeTakeFirst()

    return {
        data: entries,
        meta: {
            current_page: payload.page,
            per_page: payload.limit,
            total: Number(total?.count || 0),
            last_page: Math.ceil(Number(total?.count || 0) / payload.limit)
        }
    }
})

export default router
