import Base from '#ledger/shared/entities/account.entity.ts'
import { Model } from '#server/mixins/model.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Account extends composeWith(
    Base, 
    Model('ledger__accounts')
) {

}