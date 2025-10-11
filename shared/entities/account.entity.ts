import { $t } from '#shared/lang.ts'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export const TYPES = [
    { 
        label: $t('Asset'), 
        value: 'asset' 
    },
    { 
        label: $t('Liability'),
        value: 'liability' 
    },
    { 
        label: $t('Equity'),
        value: 'equity' 
    },
    { 
        label: $t('Income'),
        value: 'income' 
    },
    { 
        label: $t('Expense'),
        value: 'expense' 
    },
]

export default class Account extends compose(BaseEntity, Timestamp, SoftDelete) {
    public static TYPES = TYPES
    
    public id: number
    public name: string
    public type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
    public description: string | null
    public parent_id: number | null

    public get typeLabel() {
        const type = TYPES.find(t => t.value === this.type)
        
        return type ? type.label : this.type
    }
}