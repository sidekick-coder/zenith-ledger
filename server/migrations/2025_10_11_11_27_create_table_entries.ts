import { Kysely } from 'kysely'

const table = 'ledger__entries'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('transaction_id', 'integer', col => col.notNull()
            .references('ledger__transactions.id')
            .onDelete('cascade')
        )
        .addColumn('account_id', 'integer', col => col.notNull()
            .references('ledger__accounts.id')
            .onDelete('cascade')
        )
        .addColumn('type', 'varchar(10)', col => col.notNull()) // 'debit' | 'credit'
        .addColumn('amount', 'integer', col => col.notNull())
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

