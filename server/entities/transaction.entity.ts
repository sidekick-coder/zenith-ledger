import Base from '#ledger/shared/entities/transaction.entity.ts'
import { Model } from '#server/mixins/model.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Transaction extends composeWith(
    Base, 
    Model('ledger__transactions')
) {

}