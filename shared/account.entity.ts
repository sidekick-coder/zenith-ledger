import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Account extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public name: string
    public type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
    public description: string | null
    public parent_id: number | null
}