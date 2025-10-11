import type Entry from './entry.entity'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Transaction extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public description: string | null

    // Relations - entries associated with this transaction
    public entries?: Entry[]

    // debit account
    public debit_account_id?: number
    public debit_account_name?: string

    // debit entry 
    public debit_id?: number
    public debit_amount?: number

    // credit entry
    public credit_id?: number
    public credit_amount?: number

    // credit account
    public credit_account_id?: number
    public credit_account_name?: string
}