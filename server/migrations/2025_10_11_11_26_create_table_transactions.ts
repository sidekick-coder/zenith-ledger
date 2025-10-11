import { Kysely } from 'kysely'

const table = 'ledger__transactions'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('description', 'text')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

