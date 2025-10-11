import { Kysely } from 'kysely'

const table = 'ledger__accounts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('parent_id', 'integer', col => col.references('ledger__accounts.id').onDelete('set null'))
        .addColumn('type', 'varchar(20)', col => col.notNull())
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

