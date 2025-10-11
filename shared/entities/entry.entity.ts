import { $t } from '#shared/lang.ts'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export const TYPES = [
    { 
        label: $t('Debit'), 
        value: 'debit' 
    },
    { 
        label: $t('Credit'),
        value: 'credit' 
    }
]

export default class Entry extends compose(BaseEntity, Timestamp, SoftDelete) {
    public static TYPES = TYPES
    
    public id: number
    public transaction_id: number
    public account_id: number
    public type: 'debit' | 'credit'
    public amount: number

    // Relations
    public account_name?: string
    public account_type?: string
    public transaction_description?: string

    public get typeLabel() {
        const type = TYPES.find(t => t.value === this.type)
        return type ? type.label : this.type
    }
}