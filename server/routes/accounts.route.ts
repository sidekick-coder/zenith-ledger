import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import * as schemas from '#ledger/shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import Account from '#ledger/server/entities/account.entity.ts'
import db from '#server/facades/db.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import { $t } from '#shared/lang.ts'

const router = rootRouter.prefix('/api/ledger/accounts')
    .use(authMiddleware)
    .group()

router.get('/', async ({ query, acl }) => {
    acl.authorize('read', 'Account')

    const payload = validator.validate(query, schemas.pagination.schema)

    const pagination = await Account.paginate({
        page: payload.page,
        limit: payload.limit,
        query: () => db.selectFrom('ledger__accounts as a')
            .selectAll('a')
            .where(undeleted.column('a.deleted_at'))
            .leftJoin('ledger__accounts as p', 'a.parent_id', 'p.id')
            .select([
                'p.name as parent_name',
                'p.type as parent_type'
            ])
            .orderBy('created_at', 'desc')
    })

    return pagination
})

router.get('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const account = await Account.findOneOrFail({
        query: q => q.where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('read', account)

    return account
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'Account')

    const payload = validator.validate(body, schemas.account.create)

    // Validate parent account exists if parent_id is provided
    if (payload.parent_id) {
        await Account.findOneOrFail({
            query: q => q.where('id', '=', payload.parent_id!)
                .where(undeleted)
                .select(['id'])
        })
    }

    const account = await Account.create({
        name: payload.name,
        type: payload.type,
        description: payload.description,
        parent_id: payload.parent_id
    })

    return account
})

router.put('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const payload = validator.validate(body, schemas.account.update)

    const account = await Account.findOneOrFail({
        query: q => q
            .where('id', '=', id)
            .where(undeleted)
            .selectAll()
    })

    acl.authorize('update', account)

    if (account.id === payload.parent_id) {
        throw new BaseException($t('An account cannot be its own parent.'))
    }

    // Validate parent account exists if parent_id is provided
    if (payload.parent_id) {
        await Account.findOneOrFail({
            query: q => q.where('id', '=', payload.parent_id!)
                .where(undeleted)
                .select(['id'])
        })
    }

    await Account.updateById(account.id, payload)

    account.merge(payload)

    return account
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    
    const account = await Account.findOneOrFail({
        query: q => q.where('id', '=', id).selectAll()
    })

    acl.authorize('delete', account)

    await account.softDelete()

    return account
})

export default router
