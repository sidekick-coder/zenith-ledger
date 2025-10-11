import * as account from './account.validator.ts'
import { schema as pagination } from '#shared/validators/pagination.validator.ts'
import * as query from '#shared/validators/query.validator.ts'

export default {
    account,
    pagination,
    query
}