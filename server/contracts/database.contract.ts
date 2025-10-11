import type { Generated } from 'kysely'
import type { SoftDeleteTable, TimestampTable } from '#server/queries/index.ts'

export interface AccountsTable extends TimestampTable, SoftDeleteTable {
    id: Generated<number>
    name: string
    description: string | null
    parent_id: number | null
    type: string
}

export interface TransactionsTable extends TimestampTable, SoftDeleteTable {
    id: Generated<number>
    description: string | null
}

export interface EntriesTable extends TimestampTable, SoftDeleteTable {
    id: Generated<number>
    transaction_id: number
    account_id: number
    type: 'debit' | 'credit'
    amount: number
}

declare module '#server/contracts/database.contract' {
    export interface Database {
        ledger__accounts: AccountsTable
        ledger__transactions: TransactionsTable
        ledger__entries: EntriesTable
    }
}
